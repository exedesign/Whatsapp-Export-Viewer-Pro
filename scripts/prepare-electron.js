const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = process.cwd();
const staging = path.join(root, '.electron-app');

function exec(cmd){
  cp.execSync(cmd, { stdio: 'inherit' });
}

function rimraf(p){ if(fs.existsSync(p)) fs.rmSync(p,{recursive:true,force:true}); }
function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }
function copyDir(src,dst){ if(!fs.existsSync(src)) return; for(const e of fs.readdirSync(src,{withFileTypes:true})) { const s=path.join(src,e.name); const d=path.join(dst,e.name); if(e.isDirectory()){ copyDir(s,d);} else if(e.isFile()){ ensureDir(path.dirname(d)); fs.copyFileSync(s,d);} } }

console.log('> Cleaning staging');
rimraf(staging); ensureDir(staging);
console.log('> Building Next (static export)');
exec('npm run build');
if(!fs.existsSync(path.join(root,'out'))) { console.error('out not found'); process.exit(1);}  
console.log('> Copy runtime');
copyDir(path.join(root,'out'), path.join(staging,'out'));
fs.copyFileSync(path.join(root,'main.js'), path.join(staging,'main.js'));
fs.writeFileSync(path.join(staging,'package.json'), JSON.stringify({
  name: 'whatsapp-chat-viewer-tr',
  productName: 'WhatsApp Chat Viewer TR',
  version: '3.0.0',
  main: 'main.js'
}, null, 2));
if(fs.existsSync(path.join(root,'icon.ico'))) fs.copyFileSync(path.join(root,'icon.ico'), path.join(staging,'icon.ico'));
console.log('> Staging ready (.electron-app)');
