const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = process.cwd();
const iconSource = path.join(root, 'icon.ico');
const buildDir = path.join(root, 'build');
const iconIcns = path.join(buildDir, 'icon.icns');

function ensureDir(p) { 
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); 
}

// Verify source icon exists
if (!fs.existsSync(iconSource)) {
  console.error('HATA: icon.ico kök klasörde bulunamadı.');
  process.exit(1);
}

ensureDir(buildDir);

// Check if we're on macOS
const isMac = process.platform === 'darwin';

if (!isMac) {
  console.log('> macOS icon conversion skipped (not running on macOS)');
  process.exit(0);
}

// Check if icon.icns already exists
if (fs.existsSync(iconIcns)) {
  console.log('> build/icon.icns already exists');
  process.exit(0);
}

console.log('> Creating icon.icns for macOS from icon.ico...');

// Create temporary directory for iconset
const tmpIconset = path.join(buildDir, 'icon.iconset');
ensureDir(tmpIconset);

try {
  // Extract PNG from ICO and create different sizes
  // macOS icon sizes: 16, 32, 64, 128, 256, 512, 1024
  const sizes = [16, 32, 64, 128, 256, 512];
  
  // Use sips to convert .ico to PNG at different sizes
  // First, convert ico to a base PNG
  const basePng = path.join(buildDir, 'icon-base.png');
  
  // Extract the largest size from ico (usually 256x256)
  cp.execSync(`sips -s format png "${iconSource}" --out "${basePng}"`, { stdio: 'inherit' });
  
  // Generate all required sizes
  for (const size of sizes) {
    const fileName1x = `icon_${size}x${size}.png`;
    const fileName2x = `icon_${size}x${size}@2x.png`;
    
    // Create 1x version
    cp.execSync(
      `sips -z ${size} ${size} "${basePng}" --out "${path.join(tmpIconset, fileName1x)}"`,
      { stdio: 'inherit' }
    );
    
    // Create 2x version (except for 512, which would be 1024)
    if (size < 512) {
      const size2x = size * 2;
      cp.execSync(
        `sips -z ${size2x} ${size2x} "${basePng}" --out "${path.join(tmpIconset, fileName2x)}"`,
        { stdio: 'inherit' }
      );
    }
  }
  
  // Also create the 512@2x (1024x1024)
  cp.execSync(
    `sips -z 1024 1024 "${basePng}" --out "${path.join(tmpIconset, 'icon_512x512@2x.png')}"`,
    { stdio: 'inherit' }
  );
  
  // Convert iconset to icns using iconutil
  cp.execSync(`iconutil -c icns "${tmpIconset}" -o "${iconIcns}"`, { stdio: 'inherit' });
  
  // Cleanup
  fs.rmSync(tmpIconset, { recursive: true, force: true });
  if (fs.existsSync(basePng)) fs.unlinkSync(basePng);
  
  console.log('✓ build/icon.icns oluşturuldu');
} catch (error) {
  console.error('Icon conversion failed:', error.message);
  // Cleanup on failure
  if (fs.existsSync(tmpIconset)) fs.rmSync(tmpIconset, { recursive: true, force: true });
  process.exit(1);
}
