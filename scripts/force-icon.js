const path = require('path');
const fs = require('fs');
const rcedit = require('rcedit');

(async () => {
  try {
    const exePath = path.join(__dirname,'..','portable','WhatsApp Chat Viewer TR-win32-x64','WhatsApp Chat Viewer TR.exe');
    const iconPath = path.join(__dirname,'..','build','icon.ico');
    if(!fs.existsSync(exePath)) { console.error('Exe bulunamadı:', exePath); process.exit(1);}    
    if(!fs.existsSync(iconPath)) { console.error('Icon bulunamadı:', iconPath); process.exit(1);}  
    console.log('> RCEDIT ikon patch başlıyor');
    await rcedit(exePath, { icon: iconPath });
    console.log('> RCEDIT ikon patch tamamlandı');
  } catch (e) {
    console.error('Ikon patch hata:', e.message);
    process.exit(1);
  }
})();
