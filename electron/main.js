const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const { pathToFileURL } = require('url');
const isDev = require('electron-is-dev');

let mainWindow;
let unsavedState = { hasUnsaved: false, fileName: '', filePath: '', content: '', isTemp: false };
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true
  });

  mainWindow.on('close', async (event) => {
    if (isQuitting) return;
    if (!unsavedState?.hasUnsaved) return;

    event.preventDefault();

    const fileLabel = unsavedState?.fileName || 'Untitled';
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Save', "Don't Save", 'Cancel'],
      defaultId: 0,
      cancelId: 2,
      title: 'Unsaved Changes',
      message: `Do you want to save changes to ${fileLabel}?`,
      detail: 'Your changes will be lost if you don\'t save.'
    });

    if (response === 0) {
      const saveResult = await saveUnsavedState();
      if (saveResult?.success) {
        isQuitting = true;
        mainWindow.close();
      }
      return;
    }

    if (response === 1) {
      isQuitting = true;
      mainWindow.close();
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const sanitizeFileName = (name) => {
  if (!name || typeof name !== 'string') return 'untitled';
  return name.replace(/[\\/:*?"<>|]/g, '').trim() || 'untitled';
};

const saveUnsavedState = async () => {
  try {
    const content = unsavedState?.content ?? '';
    const filePath = unsavedState?.filePath || '';
    const fileName = sanitizeFileName(unsavedState?.fileName || 'untitled.txt');

    if (filePath) {
      await fs.writeFile(filePath, content, 'utf8');
      return { success: true, filePath };
    }

    const { canceled, filePath: selectedPath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save File',
      defaultPath: fileName
    });

    if (canceled || !selectedPath) {
      return { success: false, canceled: true };
    }

    await fs.writeFile(selectedPath, content, 'utf8');
    return { success: true, filePath: selectedPath };
  } catch (err) {
    console.error('saveUnsavedState error', err);
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Save Failed',
      message: 'Failed to save the file.',
      detail: err.message || 'Unknown error'
    });
    return { success: false, error: err.message };
  }
};

// IPC handlers for file system operations
ipcMain.handle('open-folder', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (canceled || !filePaths || filePaths.length === 0) return null;
    return filePaths[0];
  } catch (err) {
    console.error('open-folder error', err);
    return null;
  }
});

ipcMain.handle('read-directory', async (event, dirPath) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.map((ent) => ({
      name: ent.name,
      path: path.join(dirPath, ent.name),
      isDirectory: ent.isDirectory()
    }));
  } catch (err) {
    console.error('read-directory error', err);
    return [];
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { success: true, content };
  } catch (err) {
    console.error('read-file error', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return { success: true };
  } catch (err) {
    console.error('write-file error', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('save-file-as', async (event, payload) => {
  try {
    const defaultPath = payload?.defaultPath || 'untitled.txt';
    const content = payload?.content || '';

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save File',
      defaultPath
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    await fs.writeFile(filePath, content, 'utf8');
    return { success: true, filePath };
  } catch (err) {
    console.error('save-file-as error', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-temp-dir', async () => {
  try {
    return { success: true, tempDir: app.getPath('temp') };
  } catch (err) {
    console.error('get-temp-dir error', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('save-temp-file', async (event, payload) => {
  try {
    // Try multiple temp directory options with fallbacks
    const tempDirs = [
      path.join(app.getPath('temp'), 'neuro-code-editor'),
      path.join(app.getPath('userData'), 'temp'),
      path.join(app.getPath('home'), '.neuro-temp'),
      path.join(process.cwd(), '.neuro-temp')
    ];

    let baseDir = null;
    let lastError = null;

    // Try each directory in order until one succeeds
    for (const dir of tempDirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        // Verify directory is writable
        const testFile = path.join(dir, `.write-test-${Date.now()}`);
        await fs.writeFile(testFile, '', 'utf8');
        await fs.unlink(testFile);
        baseDir = dir;
        console.debug('[save-temp-file] Using temp directory:', baseDir);
        break;
      } catch (e) {
        lastError = e;
        console.debug(`[save-temp-file] Failed to use ${dir}:`, e.message);
        continue;
      }
    }

    if (!baseDir) {
      throw new Error(`Unable to create temp directory. Tried: ${tempDirs.join(', ')}. Last error: ${lastError?.message}`);
    }

    const rawName = payload?.fileName || 'untitled';
    const safeName = sanitizeFileName(rawName);
    const parsed = path.parse(safeName);
    const ext = parsed.ext || (payload?.extension ? `.${sanitizeFileName(payload.extension)}` : '.txt');
    const baseName = parsed.name || 'untitled';
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const fileName = `${baseName}-${unique}${ext}`;
    const filePath = path.join(baseDir, fileName);
    const content = payload?.content || '';

    await fs.writeFile(filePath, content, 'utf8');
    return { success: true, filePath };
  } catch (err) {
    console.error('save-temp-file error', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('list-recovered-files', async () => {
  try {
    const tempDirs = [
      path.join(app.getPath('temp'), 'neuro-code-editor'),
      path.join(app.getPath('userData'), 'temp'),
      path.join(app.getPath('home'), '.neuro-temp'),
      path.join(process.cwd(), '.neuro-temp')
    ];

    const recoveredFiles = [];

    for (const dir of tempDirs) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isFile()) {
            const filePath = path.join(dir, entry.name);
            const stats = await fs.stat(filePath);
            const content = await fs.readFile(filePath, 'utf8');
            
            recoveredFiles.push({
              name: entry.name,
              path: filePath,
              size: stats.size,
              modified: stats.mtime,
              content: content
            });
          }
        }
      } catch (e) {
        // Skip directories that don't exist or can't be read
        console.debug(`[list-recovered-files] Skipped ${dir}:`, e.message);
      }
    }

    // Sort by modification time (newest first)
    recoveredFiles.sort((a, b) => b.modified - a.modified);

    return { success: true, files: recoveredFiles };
  } catch (err) {
    console.error('list-recovered-files error', err);
    return { success: false, error: err.message, files: [] };
  }
});

ipcMain.handle('delete-recovered-file', async (event, filePath) => {
  try {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path');
    }
    
    await fs.unlink(filePath);
    return { success: true };
  } catch (err) {
    console.error('delete-recovered-file error', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('create-file', async (event, filePath) => {
  try {
    await fs.writeFile(filePath, '', { flag: 'wx' });
    return { success: true };
  } catch (err) {
    console.error('create-file error', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('create-folder', async (event, folderPath) => {
  try {
    await fs.mkdir(folderPath, { recursive: true });
    return { success: true };
  } catch (err) {
    console.error('create-folder error', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('delete-path', async (event, targetPath) => {
  try {
    const stat = await fs.stat(targetPath);
    if (stat.isDirectory()) {
      await fs.rmdir(targetPath, { recursive: true });
    } else {
      await fs.unlink(targetPath);
    }
    return { success: true };
  } catch (err) {
    console.error('delete-path error', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('show-unsaved-prompt', async (event, payload) => {
  try {
    const fileLabel = payload?.fileName || 'Untitled';
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Save', "Don't Save", 'Cancel'],
      defaultId: 0,
      cancelId: 2,
      title: 'Unsaved Changes',
      message: `Do you want to save changes to ${fileLabel}?`,
      detail: 'Your changes will be lost if you don\'t save.'
    });

    if (response === 0) return { choice: 'save' };
    if (response === 1) return { choice: 'dont-save' };
    return { choice: 'cancel' };
  } catch (err) {
    console.error('show-unsaved-prompt error', err);
    return { choice: 'cancel', error: err.message };
  }
});

ipcMain.on('set-unsaved-state', (event, payload) => {
  unsavedState = {
    hasUnsaved: !!payload?.hasUnsaved,
    fileName: payload?.fileName || '',
    filePath: payload?.filePath || '',
    content: payload?.content ?? '',
    isTemp: !!payload?.isTemp
  };
});

// IPC handler to run files based on type
ipcMain.handle('run-file', async (event, payload) => {
  try {
    const filePath = payload?.filePath;
    const runTarget = payload?.runTarget;

    console.debug('[run-file] payload:', payload);

    if (!filePath || typeof filePath !== 'string') {
      return { success: false, error: 'Invalid file path.' };
    }

    if (!runTarget || typeof runTarget !== 'string') {
      return { success: false, error: 'Invalid run target.' };
    }

    // Ensure file exists
    try {
      await fs.stat(filePath);
    } catch {
      return { success: false, error: `File not found: ${filePath}` };
    }

    if (runTarget === 'html') {
      const fileUrl = pathToFileURL(filePath).toString();
      const opened = await shell.openExternal(fileUrl);
      return { success: true, info: opened ? 'Opened HTML in default browser.' : 'HTML opened.' };
    }

    let command = null;
    let args = [];
    if (runTarget === 'python') {
      command = 'python';
      args = [filePath];
    } else if (runTarget === 'node') {
      command = 'node';
      args = [filePath];
    } else {
      return { success: false, error: `Unsupported run target: ${runTarget}` };
    }

    return await new Promise((resolve) => {
      const child = spawn(command, args, { cwd: path.dirname(filePath) });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (err) => {
        resolve({ success: false, error: err.message || 'Failed to start process.' });
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output: stdout.trim() });
        } else {
          resolve({ success: false, error: (stderr || stdout || '').trim(), exitCode: code });
        }
      });
    });
  } catch (err) {
    console.error('[run-file] error', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
});
