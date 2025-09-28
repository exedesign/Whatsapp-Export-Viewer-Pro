const path = require('path');
const fs = require('fs');
const { createWindowsInstaller } = require('electron-winstaller');

(async () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(),'package.json'),'utf8'));
  const distDir = path.join(process.cwd(), 'portable', 'WhatsApp Chat Viewer TR-win32-x64');
  if(!fs.existsSync(distDir)) { console.error('Önce portable build üret (npm run pack-win-portable)'); process.exit(1); }
  const outputDirectory = path.join(process.cwd(), 'installer');
  if(!fs.existsSync(outputDirectory)) fs.mkdirSync(outputDirectory,{recursive:true});
  const opts = {
    appDirectory: distDir,
    outputDirectory,
    authors: 'Fatih Eke',
    exe: 'WhatsApp Chat Viewer TR.exe',
    description: 'WhatsApp Chat Viewer TR',
  version: pkg.version,
  setupExe: `WhatsAppChatViewerTR-Setup-${pkg.version}.exe`,
    noMsi: true,
    setupIcon: path.join(process.cwd(),'icon.ico'),
    skipUpdateIcon: true
  };
  console.log('> Installer oluşturuluyor...');
  await createWindowsInstaller(opts);
  console.log('✓ Installer hazır');
})().catch(e=>{ console.error(e); process.exit(1);});
