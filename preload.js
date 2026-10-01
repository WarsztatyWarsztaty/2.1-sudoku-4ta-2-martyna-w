const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onMenuNewGame: (callback) => ipcRenderer.on('menu-new-game', (_event, diff) => callback(diff)),
  onMenuRestartGame: (callback) => ipcRenderer.on('menu-restart-game', () => callback()),
  onMenuTogglePause: (callback) => ipcRenderer.on('menu-toggle-pause', () => callback()),
  onMenuUndo: (callback) => ipcRenderer.on('menu-undo', () => callback()),
  onMenuErase: (callback) => ipcRenderer.on('menu-erase', () => callback()),
  onMenuToggleNotes: (callback) => ipcRenderer.on('menu-toggle-notes', () => callback()),
  onMenuHint: (callback) => ipcRenderer.on('menu-hint', () => callback()),
  onMenuToggleTheme: (callback) => ipcRenderer.on('menu-toggle-theme', () => callback()),
  onMenuShowStats: (callback) => ipcRenderer.on('menu-show-stats', () => callback()),
  onMenuShowRules: (callback) => ipcRenderer.on('menu-show-rules', () => callback()),
  onMenuShowAbout: (callback) => ipcRenderer.on('menu-show-about', () => callback())
});
