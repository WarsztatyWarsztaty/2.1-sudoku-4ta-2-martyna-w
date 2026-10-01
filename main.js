const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1060,
    height: 860,
    minWidth: 840,
    minHeight: 680,
    title: 'Sudoku Mistrz - Polska Aplikacja Pulpitowa',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#0f172a',
    show: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Tworzenie menu aplikacji w języku polskim
  const menuTemplate = [
    {
      label: 'Gra',
      submenu: [
        {
          label: 'Nowa gra - Łatwy',
          click: () => mainWindow.webContents.send('menu-new-game', 'easy')
        },
        {
          label: 'Nowa gra - Średni',
          click: () => mainWindow.webContents.send('menu-new-game', 'medium')
        },
        {
          label: 'Nowa gra - Trudny',
          click: () => mainWindow.webContents.send('menu-new-game', 'hard')
        },
        {
          label: 'Nowa gra - Ekspert',
          click: () => mainWindow.webContents.send('menu-new-game', 'expert')
        },
        { type: 'separator' },
        {
          label: 'Restartuj bieżącą planszę',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.webContents.send('menu-restart-game')
        },
        {
          label: 'Pauza / Wznów',
          accelerator: 'Space',
          click: () => mainWindow.webContents.send('menu-toggle-pause')
        },
        { type: 'separator' },
        {
          label: 'Wyjdź',
          role: 'quit'
        }
      ]
    },
    {
      label: 'Edycja',
      submenu: [
        {
          label: 'Cofnij ruch',
          accelerator: 'CmdOrCtrl+Z',
          click: () => mainWindow.webContents.send('menu-undo')
        },
        {
          label: 'Wyczyść zaznaczone pole',
          accelerator: 'Backspace',
          click: () => mainWindow.webContents.send('menu-erase')
        },
        {
          label: 'Przełącz tryb notatek (Ołówek)',
          accelerator: 'N',
          click: () => mainWindow.webContents.send('menu-toggle-notes')
        },
        {
          label: 'Podpowiedź',
          accelerator: 'H',
          click: () => mainWindow.webContents.send('menu-hint')
        }
      ]
    },
    {
      label: 'Widok',
      submenu: [
        {
          label: 'Przełącz motyw (Jasny / Ciemny)',
          accelerator: 'CmdOrCtrl+T',
          click: () => mainWindow.webContents.send('menu-toggle-theme')
        },
        {
          label: 'Statystyki gracza',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu-show-stats')
        },
        { type: 'separator' },
        { label: 'Powiększ', role: 'zoomIn' },
        { label: 'Pomniejsz', role: 'zoomOut' },
        { label: 'Rozmiar domyślny', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Pełny ekran', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Pomoc',
      submenu: [
        {
          label: 'Zasady Sudoku i Skróty',
          click: () => mainWindow.webContents.send('menu-show-rules')
        },
        {
          label: 'O aplikacji',
          click: () => mainWindow.webContents.send('menu-show-about')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
