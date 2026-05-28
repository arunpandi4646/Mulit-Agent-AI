import React, { useState, useEffect } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaPlus, FaTrash } from 'react-icons/fa';
import './FileExplorer.css';

const FileExplorer = ({ onFileSelect, currentFile, onLog }) => {
  const [rootPath, setRootPath] = useState(null);
  const [fileTree, setFileTree] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const openFolder = async () => {
    if (!window?.electronAPI?.openFolder) {
      // In a browser fallback: do nothing (avoid modal alerts)
      console.warn('File system access only available in Electron');
      return;
    }

    const folderPath = await window.electronAPI.openFolder();
    if (folderPath) {
      setRootPath(folderPath);
      const entries = await loadDirectory(folderPath, 0);
      setFileTree(entries);
      if (onLog) onLog(`Opened folder: ${folderPath}`, 'info');
    }
  };

  const loadDirectory = async (dirPath, depth = 0) => {
    if (!window.electronAPI) return;

    const entries = await window.electronAPI.readDirectory(dirPath);
    return entries.map(entry => ({
      ...entry,
      depth,
      children: entry.isDirectory ? [] : null
    }));
  };

  const updateTreeWithChildren = (nodes, targetPath, children) => {
    return nodes.map(node => {
      if (node.path === targetPath) {
        return { ...node, children };
      }
      if (node.isDirectory && Array.isArray(node.children)) {
        return { ...node, children: updateTreeWithChildren(node.children, targetPath, children) };
      }
      return node;
    });
  };

  const toggleFolder = async (folderItem) => {
    const newExpanded = new Set(expandedFolders);
    const folderPath = folderItem.path;
    
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
      if (onLog) onLog(`Folder closed: ${folderPath}`, 'info');
    } else {
      newExpanded.add(folderPath);
      // Load children if not loaded
      const children = await loadDirectory(folderPath, folderItem.depth + 1);
      setFileTree(prev => updateTreeWithChildren(prev, folderPath, children));
      if (onLog) onLog(`Folder opened: ${folderPath}`, 'info');
    }
    
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = async (filePath) => {
    if (!window.electronAPI) return;

    const result = await window.electronAPI.readFile(filePath);
    if (result.success) {
      onFileSelect({
        path: filePath,
        content: result.content,
        name: filePath.split(/[\\/]/).pop()
      });
    }
  };

  useEffect(() => {
    if (rootPath) {
      loadDirectory(rootPath).then(setFileTree);
    }
  }, [rootPath]);

  const renderTreeItem = (item) => {
    const isExpanded = expandedFolders.has(item.path);
    const isSelected = currentFile?.path === item.path;

    return (
      <div key={item.path} className="tree-item">
        <div
          className={`tree-item-content ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${item.depth * 16 + 8}px` }}
          onClick={() => item.isDirectory ? toggleFolder(item) : handleFileClick(item.path)}
        >
          {item.isDirectory ? (
            isExpanded ? <FaFolderOpen className="icon" /> : <FaFolder className="icon" />
          ) : (
            <FaFile className="icon" />
          )}
          <span className="tree-item-name">{item.name}</span>
        </div>
        {item.isDirectory && isExpanded && item.children && (
          <div className="tree-children">
            {item.children.map(renderTreeItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <span className="explorer-title">EXPLORER</span>
        <div className="explorer-actions">
          <button onClick={openFolder} title="Open Folder">
            <FaFolderOpen />
          </button>
        </div>
      </div>
      
      <div className="explorer-content">
        {!rootPath ? (
          <div className="empty-state">
            <p>No folder opened</p>
            <button className="open-folder-btn" onClick={openFolder}>
              Open Folder
            </button>
          </div>
        ) : (
          <div className="file-tree">
            {fileTree.map(renderTreeItem)}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
