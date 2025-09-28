const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = process.cwd();
const staging = path.join(root, '.electron-app');
const iconSource = path.join(root, 'icon.ico');
const iconBuild = path.join(root, 'build', 'icon.ico');
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));

function exec(cmd){
  cp.execSync(cmd, { stdio: 'inherit' });
}

function rimraf(p){ if(fs.existsSync(p)) fs.rmSync(p,{recursive:true,force:true}); }
function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }
function copyDir(src,dst){ if(!fs.existsSync(src)) return; for(const e of fs.readdirSync(src,{withFileTypes:true})) { const s=path.join(src,e.name); const d=path.join(dst,e.name); if(e.isDirectory()){ copyDir(s,d);} else if(e.isFile()){ ensureDir(path.dirname(d)); fs.copyFileSync(s,d);} } }

console.log('> Cleaning staging');
rimraf(staging); ensureDir(staging);
console.log('> Building & Exporting Next (static)');
process.env.NEXT_DISABLE_ESLINT = '1';
exec('npm run build');
// output: 'export' olduğu için ayrı export komutuna gerek yok; out zaten üretilir.
const outDir = path.join(root,'out');
if(!fs.existsSync(outDir)) { console.error('out static export not found'); process.exit(1);}  
console.log('> Copy static export (out)');
copyDir(outDir, path.join(staging,'out'));
// Güvenlik: index.html içinde hala mutlak /_next başlıyorsa relative'e çevir
const indexPath = path.join(staging,'out','index.html');
if(fs.existsSync(indexPath)){
  let html = fs.readFileSync(indexPath,'utf8');
  if(html.includes('"/_next/')){
    html = html.replace(/\"\/_next\//g,'"./_next/');
    fs.writeFileSync(indexPath, html);
    console.log('> index.html mutlak /_next referansları relative hale getirildi');
  }
}
fs.copyFileSync(path.join(root,'main.js'), path.join(staging,'main.js'));
fs.writeFileSync(path.join(staging,'package.json'), JSON.stringify({
  name: 'whatsapp-chat-viewer-tr',
  productName: 'WhatsApp Chat Viewer TR',
  version: pkg.version,
  description: pkg.description,
  author: pkg.author,
  main: 'main.js'
}, null, 2));
// Icon doğrulama ve build/icon.ico oluşturma
if(!fs.existsSync(iconSource)) {
  console.error('HATA: icon.ico kök klasörde bulunamadı. Paketleme durduruldu.');
  process.exit(1);
}
// build/icon.ico yoksa kopyala (electron-builder bu yolu kullanıyor)
if(!fs.existsSync(iconBuild)) {
  ensureDir(path.dirname(iconBuild));
  fs.copyFileSync(iconSource, iconBuild);
  console.log('> build/icon.ico oluşturuldu');
}
// Staging içine de koy (electron-packager portable için)
fs.copyFileSync(iconSource, path.join(staging,'icon.ico'));
console.log('> Icon yerleştirildi:', iconSource);
console.log('> Staging ready (.electron-app)');
