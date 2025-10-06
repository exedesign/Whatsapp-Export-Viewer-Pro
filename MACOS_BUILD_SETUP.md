# macOS Build Kurulumu - GitHub Actions

## Yapılan Değişiklikler

Bu PR, macOS bilgisayara ihtiyaç duymadan GitHub Actions üzerinden otomatik macOS build'leri oluşturmak için gerekli değişiklikleri içerir.

### 1. macOS İkon Dönüştürme Scripti (`scripts/create-mac-icon.js`)

macOS için gerekli `.icns` formatındaki ikon dosyasını `.ico` dosyasından otomatik olarak oluşturan yeni bir script eklendi.

**Özellikler:**
- macOS'un yerleşik `sips` ve `iconutil` araçlarını kullanır
- Tüm gerekli ikon boyutlarını (16x16'dan 1024x1024'e kadar) oluşturur
- Retina ekranlar için @2x versiyonlarını üretir
- macOS dışı platformlarda gracefully exit yapar (hata vermez)

**Kullanım:**
```bash
npm run create-mac-icon
```

### 2. GitHub Actions Workflow Güncellemesi

`.github/workflows/release.yml` dosyasına macOS ikon oluşturma adımı eklendi:

```yaml
- name: Create macOS icon
  run: node scripts/create-mac-icon.js
```

Bu adım, macOS build'leri başlamadan önce otomatik olarak `build/icon.icns` dosyasını oluşturur.

### 3. Dokümantasyon Güncellemeleri

- **RELEASE_INSTRUCTIONS.md**: Otomatik build süreci açıklamaları eklendi
- **CHANGELOG.md**: Yeni özellikler ve değişiklikler listelendi
- **package.json**: `create-mac-icon` npm scripti eklendi

## GitHub Actions İş Akışı

Tag oluşturulduğunda (`v*` formatında):

1. **build-windows** job'u Windows build'lerini oluşturur
2. **build-mac** job'u:
   - macOS runner'da çalışır
   - Node.js 20 kurulur
   - Bağımlılıklar yüklenir (`npm ci`)
   - **ÖNEMLİ**: `icon.icns` dosyası otomatik oluşturulur
   - arm64 (Apple Silicon) build oluşturulur
   - x64 (Intel) build oluşturulur
   - DMG ve ZIP dosyaları üretilir
3. **draft-release** job'u tüm dosyaları toplayıp draft release oluşturur

## Kullanım

### Yeni Release Oluşturmak İçin:

1. Sürüm numarasını güncelleyin:
   ```bash
   # package.json'da version değiştirin
   # CHANGELOG.md güncelleyin
   git add package.json CHANGELOG.md
   git commit -m "Bump version to vX.Y.Z"
   git push
   ```

2. Tag oluşturun ve push yapın:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

3. GitHub Actions otomatik olarak çalışacak ve draft release oluşturacak

4. [Releases sayfasına](https://github.com/exedesign/Whatsapp-Export-Viewer-Pro/releases) gidip release'i yayınlayın

## Beklenen Çıktılar

Her tag için şu dosyalar oluşturulacak:

### Windows:
- `WhatsApp Chat Viewer TR Setup X.Y.Z.exe` (Installer)
- `WhatsApp-Chat-Viewer-TR-portable-X.Y.Z.zip` (Portable)

### macOS:
- `WhatsApp Chat Viewer TR-X.Y.Z.dmg` (Universal DMG)
- `WhatsApp Chat Viewer TR-X.Y.Z-mac-arm64.dmg` (Apple Silicon)
- `WhatsApp Chat Viewer TR-X.Y.Z-mac-x64.dmg` (Intel)
- `WhatsApp Chat Viewer TR-X.Y.Z-mac-arm64.zip`
- `WhatsApp Chat Viewer TR-X.Y.Z-mac-x64.zip`

## Sorun Giderme

### Icon oluşturulamazsa:
macOS runner'ın `sips` ve `iconutil` araçları zaten yüklü olmalıdır. Eğer hata alırsanız:
- Script loglarını kontrol edin
- `icon.ico` dosyasının repository'de olduğundan emin olun

### Build başarısız olursa:
- GitHub Actions logs'ları kontrol edin
- `npm ci` adımının başarıyla tamamlandığından emin olun
- `electron-builder.yml` konfigürasyonunun doğru olduğunu kontrol edin

## Test

Build'leri test etmek için branch üzerinde test tag'i oluşturabilirsiniz:
```bash
git tag v3.2.5-test
git push origin v3.2.5-test
```

Test tamamlandıktan sonra tag'i silebilirsiniz:
```bash
git tag -d v3.2.5-test
git push origin :refs/tags/v3.2.5-test
```
