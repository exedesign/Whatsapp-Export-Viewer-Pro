# Changelog

Tüm anlamlı değişiklikler bu dosyada listelenir. Bu proje Semantic Versioning kullanır.

## [Unreleased]
### Eklendi
- GitHub Releases tabanlı manuel ve sessiz açılışta otomatik güncelleme denetimi (Electron menü: "Güncellemeleri Denetle")

## [3.2.0] - 2025-09-29
### Eklendi
- Çoklu ZIP sohbet yükleme (batch) desteği ve sohbet listesi (participant adlarıyla)
- Gelişmiş ilerleme modalı: medya ve satır sayaçları, ETA, batch göstergesi, minimize edilebilir yapı
- Asenkron (chunked) sohbet ayrıştırma ile büyük dosyalarda donma azaltma
- Batch sonunda tek seferde modal kapanma mantığı (ilk dosya bitince kapanmama düzeltmesi)

### İyileştirme
- Drag & drop flicker giderildi (dragCounter yaklaşımı)
- Medya görüntüleyici ESC ile kapanma ve erişilebilirlik dialog attribute'ları
- Çoklu sohbet arasında hızlı geçişte bellek sızıntısı riskini azaltmak için blob URL revoke temizliği

### Teknik
- `parseWhatsAppChatAsync` eklendi (chunkSize ve progress callback)
- Yükleme sırasında hatalı `_chat.txt` bulunmayan ZIP için erken uyarı

### Notlar
- Bir sonraki adımlar: Lazy media yükleme, sanallaştırılmış mesaj listesi, batch iptal butonu (henüz uygulanmadı)


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
