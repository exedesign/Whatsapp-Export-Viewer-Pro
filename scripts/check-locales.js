/* Simple locale keys consistency checker */
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');
const files = fs.readdirSync(localesDir);

// Choose English as reference
const ref = 'en';
const refData = JSON.parse(fs.readFileSync(path.join(localesDir, ref, 'common.json'), 'utf8'));
const refKeys = Object.keys(refData).sort();

let hasDiff = false;

for (const folder of files) {
  const filePath = path.join(localesDir, folder, 'common.json');
  if (!fs.existsSync(filePath)) continue;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const keys = Object.keys(data).sort();
  const missing = refKeys.filter(k => !keys.includes(k));
  const extra = keys.filter(k => !refKeys.includes(k));
  if (missing.length || extra.length) {
    hasDiff = true;
    console.log(`Locale: ${folder}`);
    if (missing.length) console.log('  Missing:', missing.join(', '));
    if (extra.length) console.log('  Extra  :', extra.join(', '));
  }
}

if (!hasDiff) {
  console.log('All locale files match reference keys.');
}
