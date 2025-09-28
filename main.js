const { app, BrowserWindow, Menu, dialog, shell, nativeImage } = require('electron');
const path = require('path');
const https = require('https');
const pkg = require('./package.json');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function resolveAppIcon() {
  // Olası konumlar: build içinde paketleme anında, root'a kopyalanmış, portable root, asar dışı
  const candidates = [
    path.join(process.cwd(), 'icon.ico'),
    path.join(__dirname, 'icon.ico'),
    path.join(__dirname, '..', 'icon.ico'),
    path.join(process.resourcesPath || '', 'icon.ico')
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      if (require('fs').existsSync(p)) {
        const img = nativeImage.createFromPath(p);
        if (!img.isEmpty()) return img;
      }
    } catch(_) {}
  }
  return undefined; // Electron default icon fallback
}

// Basit sürüm karşılaştırma (semver ilk iki bölüm önemli: major.minor.patch)
function compareVersions(a, b) {
  const pa = a.replace(/^v/, '').split('.').map(Number);
  const pb = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0; const nb = pb[i] || 0;
    if (na > nb) return 1; if (na < nb) return -1;
  }
  return 0;
}

function fetchLatestRelease() {
  return new Promise((resolve, reject) => {
    const options = {
      host: 'api.github.com',
      path: '/repos/exedesign/whatsapp-chat-viewer-tr/releases/latest',
      headers: { 'User-Agent': 'whatsapp-chat-viewer-tr' }
    };
    https
      .get(options, res => {
        let data = '';
        res.on('data', c => (data += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (e) { reject(e); }
        });
      })
      .on('error', reject);
  });
}

async function checkForUpdates(manual = false) {
  try {
    const release = await fetchLatestRelease();
    const latestTag = release.tag_name || release.name || '';
    if (!latestTag) throw new Error('Etiket bulunamadı');
    const current = `v${pkg.version}`;
    const cmp = compareVersions(latestTag, current);
    if (cmp === 1) {
      const detail = `Yeni sürüm bulundu: ${latestTag}\nMevcut sürüm: ${current}\n\nDeğişiklikler:\n${(release.body || '').split('\n').slice(0, 10).join('\n')}`;
      const r = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['İndir', 'Kapat'],
        defaultId: 0,
        title: 'Güncelleme Mevcut',
        message: 'Yeni bir sürüm yayınlanmış.',
        detail
      });
      if (r.response === 0) {
        shell.openExternal(release.html_url);
      }
    } else if (manual) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        message: 'Güncel',
        detail: `Uygulama zaten en güncel sürümde. (Mevcut: v${pkg.version})`
      });
    }
  } catch (err) {
    if (manual) {
      dialog.showMessageBox(mainWindow, {
        type: 'error',
        message: 'Güncelleme Denetimi Başarısız',
        detail: err.message
      });
    }
  }
}

function createWindow() {
  const icon = resolveAppIcon();
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5680');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'out', 'index.html'));
  }

  mainWindow.on('closed', () => (mainWindow = null));
  buildMenu();

  // Otomatik (sessiz) kontrol - uygulama açılışından kısa süre sonra
  setTimeout(() => {
    if (!isDev) {
      checkForUpdates(false);
    }
  }, 3000);
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
          label: 'Güncellemeleri Denetle',
          click: () => checkForUpdates(true)
        },
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
