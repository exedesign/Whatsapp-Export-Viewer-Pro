const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(process.cwd(), 'icon.ico')
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5680');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'out', 'index.html'));
  }

  mainWindow.on('closed', () => (mainWindow = null));
  buildMenu();
}

function buildMenu() {
  const template = [
    {
      label: 'Dosya',
      submenu: [
        { role: 'reload', label: 'Yenile' },
        { role: 'toggleDevTools', label: 'Geliştirici Araçları' },
        { type: 'separator' },
        {
          label: 'Hakkında',
          click: () => {
            dialog.showMessageBox({
              title: 'Hakkında',
              message: 'WhatsApp Chat Viewer TR\nMIT Lisansı',
              buttons: ['Kapat']
            });
          }
        },
        { type: 'separator' },
        { role: 'quit', label: 'Çıkış' }
      ]
    },
    {
      label: 'Yardım',
      submenu: [
        {
          label: 'GitHub',
          click: () => shell.openExternal('https://github.com/exedesign/whatsapp-chat-viewer-tr')
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
