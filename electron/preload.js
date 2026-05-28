const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    openFolder: () => ipcRenderer.invoke('open-folder'),
    readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
    saveFileAs: (payload) => ipcRenderer.invoke('save-file-as', payload),
    saveTempFile: (payload) => ipcRenderer.invoke('save-temp-file', payload),
    getTempDir: () => ipcRenderer.invoke('get-temp-dir'),
    listRecoveredFiles: () => ipcRenderer.invoke('list-recovered-files'),
    deleteRecoveredFile: (filePath) => ipcRenderer.invoke('delete-recovered-file', filePath),
