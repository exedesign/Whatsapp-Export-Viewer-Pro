# Changelog

Tüm anlamlı değişiklikler bu dosyada listelenir. Bu proje Semantic Versioning kullanır.

## [3.1.0] - 2025-09-29
### Eklendi
- Windows için Electron masaüstü paketleme altyapısı
  - Portable build (`npm run pack-win-portable`)
  - Installer (Squirrel) (`npm run installer`)
  - Tek dosya (SFX) paket (`npm run onefile`)
- İkon yönetimi: `icon.ico` kökten kullanılıyor
- README: Paketleme, QA checklist, release adımları
- Temiz geçmiş (squash) ve yedek dal (`backup-pre-clean`)

### Değişti
- Sürüm 3.0.0'dan 3.1.0'a yükseltildi (minor feature release)

## [3.0.0] - 2025-09-29
### Eklendi
- Tam Türkçe lokalizasyon
- WhatsApp sohbet dışa aktarımlarını çevrimdışı görüntüleme
- Mesaj arama, tarih filtreleme
- Arayüz bileşen yapısı (Next.js 13 + Tailwind + Radix UI)

### Notlar
- İlk kararlı sürüm etiketi (v3.0.0)

---

Önceki commit geçmişi 3.1.0 ile sadeleştirilmiştir; ayrıntılı geçmiş için `backup-pre-clean` dalına bakabilirsiniz.
