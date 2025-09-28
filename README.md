# WhatsApp Chat Viewer TR 🇹🇷

> **Modern, offline WhatsApp chat viewer with Turkish localization and advanced features**

![WhatsApp Chat Viewer TR](https://img.shields.io/badge/WhatsApp-Chat%20Viewer%20TR-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-13.5.1-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

WhatsApp sohbet yedeklerinizi görüntülemenizi ve analiz etmenizi sağlayan modern, çevrimdışı web uygulaması. Next.js ve TypeScript ile geliştirilmiştir ve tüm verileriniz tarayıcınızda yerel olarak işlenir. Tamamen Türkçe arayüz ve ileri düzey özelliklerle donatılmıştır.

---

**🙏 Teşekkürler | Special Thanks:** Bu proje [abishekvenkat/whatsapp-export-reader](https://github.com/abishekvenkat/whatsapp-export-reader) temel alınarak geliştirilmiştir. Orijinal projeyi oluşturan **@abishekvenkat**'a katkıları için teşekkür ederiz!

**👨‍💻 Geliştirici | Developer:** Fatih Eke  
**📅 Geliştirme Tarihi | Development Date:** 2025  
**🏷️ Versiyon | Version:** 3.0.0  

---

## ✨ Özellikler | Features

### 🚀 **Core Features**
- � **Tamamen Çevrimdışı**: Verileriniz tamamen yerel olarak işlenir
- 🇹🇷 **Türkçe Lokalizasyon**: Tam Türkçe arayüz ve mesajlar
- 🎯 **Sürükle-Bırak Desteği**: ZIP dosyalarını doğrudan sürükleyip bırakın
- � **Real-time Progress Tracking**: 4-aşamalı yükleme göstergesi
- �️ **Medya Önizleme**: Resim, video ve ses dosyaları için inline preview

### 📈 **Advanced Analytics**
- 📊 **Detaylı İstatistikler**: Mesaj sayısı, katılımcı sayısı, tarih aralığı
- 🎭 **Medya Analizi**: Resim, video, ses ve doküman sayıları
- ⏱️ **Sohbet Süresi**: Toplam sohbet süresini hesaplama
- 📅 **Tarih Navigasyonu**: Belirli tarihlere hızlı geçiş

### � **Modern UI/UX**
- 🌙 **WhatsApp Tarzı Dark Theme**: Tanıdık ve rahat kullanım
- 📱 **Responsive Design**: Mobil ve desktop uyumlu
- � **Akıllı Link Tespiti**: URL'ler ve e-postalar otomatik linklendirilir
- 🎬 **Smooth Animations**: Tailwind CSS animasyonları

### 🛡️ **Güvenlik & Privacy**
- � **Tamamen Offline**: Verileriniz hiçbir sunucuya gönderilmez
- � **Local Processing**: Tüm işlemler tarayıcınızda gerçekleşir
- 🧹 **Auto Cleanup**: Bellek ve blob URL'leri otomatik temizlenir

## 🚀 Hızlı Başlangıç | Quick Start

### 📋 Gereksinimler | Prerequisites
- Node.js 18+ 
- npm veya yarn

### ⚡ Kurulum | Installation

```bash
# Repository'yi klonlayın | Clone the repository
git clone https://github.com/exedesign/whatsapp-chat-viewer-tr.git
cd whatsapp-chat-viewer-tr

# Bağımlılıkları yükleyin | Install dependencies
npm install

# Development sunucusunu başlatın | Start development server
npm run dev
```

Tarayıcınızda `http://localhost:5680` adresine gidin.

### 🔧 Production Build

```bash
# Production build oluşturun | Create production build
npm run build

# Production sunucusunu başlatın | Start production server
npm start
```

## 📖 Kullanım | Usage

### 1️⃣ **ZIP Dosyası Yükleme | Upload ZIP File**
- WhatsApp'tan sohbetinizi export edin (Ayarlar > Sohbetler > Sohbet Geçmişini Dışa Aktar)
- ZIP dosyasını uyglamaya sürükleyip bırakın veya "WhatsApp Sohbeti Yükle" butonuna tıklayın
- Export your WhatsApp chat (Settings > Chats > Export Chat)
- Drag & drop the ZIP file or click "Upload WhatsApp Chat" button

### 2️⃣ **Medya İnceleme | Media Viewing**
- Resimleri, videoları ve ses dosyalarını doğrudan uygulamada görüntüleyin
- MediaViewer ile büyütülmüş görünüm
- Dosyaları yerel olarak indirin
- View images, videos and audio files directly in the app
- Enlarged view with MediaViewer
- Download files locally

### 3️⃣ **Arama ve Navigasyon | Search and Navigation**
- Üst kısımdaki arama çubuğunu kullanarak mesajlarda arama yapın
- Tarih seçici ile belirli günlere atlayın
- Scroll ile geçmiş mesajlara göz atın
- Use the search bar to search through messages
- Jump to specific dates with the date picker
- Scroll through message history

## 🛠️ Teknoloji Stack | Technology Stack

- **Framework**: Next.js 13.5.1 (App Router)
- **Language**: TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.3.3
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **File Processing**: JSZip
- **Date Handling**: date-fns
- **Build Tool**: Next.js built-in bundler

## 📁 Proje Yapısı | Project Structure

```
whatsapp-chat-viewer-tr/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Ana sayfa | Main page
├── components/                   # React bileşenleri | React components
│   ├── ui/                      # Temel UI bileşenleri | Basic UI components
│   ├── chat-header.tsx          # Sohbet başlığı | Chat header
│   ├── chat-message.tsx         # Mesaj bileşeni | Message component
│   ├── chat-statistics.tsx      # İstatistik paneli | Statistics panel
│   ├── loading-progress.tsx     # Yükleme göstergesi | Loading indicator
│   └── media-viewer.tsx         # Medya görüntüleyici | Media viewer
├── lib/                         # Yardımcı fonksiyonlar | Helper functions
│   ├── chat-parser.ts           # WhatsApp chat parser
│   ├── types.ts                 # TypeScript tipleri | TypeScript types
│   └── utils.ts                 # Genel yardımcılar | General utilities
└── hooks/                       # Custom React hooks
```

## 🔧 Özelleştirme | Customization

### 🎨 Tema Değiştirme | Theme Customization
`app/globals.css` dosyasında CSS değişkenlerini düzenleyerek renk temasını özelleştirebilirsiniz:

```css
:root {
  --background: 210 40% 10%;     /* Ana arkaplan | Main background */
  --foreground: 210 40% 98%;     /* Ana metin | Main text */
  --primary: 142 76% 36%;        /* WhatsApp yeşili | WhatsApp green */
}
```

### 📱 Responsive Breakpoints
Tailwind CSS'in varsayılan breakpoint'lerini kullanıyoruz:
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+
- `xl`: 1280px+

---

## 🚀 Hızlı Başlangıç | Quick Start

### Windows Kullanıcıları İçin | For Windows Users

1. **İlk Kurulum | First Setup:**
   - `Kurulum.bat` dosyasına çift tıklayın
   - Node.js otomatik kontrol edilir ve bağımlılıklar yüklenir
   - Double-click `Kurulum.bat` file
   - Node.js is automatically checked and dependencies are installed

2. **Uygulamayı Çalıştırma | Running the App:**
   - `Calistir.bat` dosyasına çift tıklayın
   - Tarayıcınızda otomatik olarak açılır: `http://localhost:5680`
   - Double-click `Calistir.bat` file
   - Opens automatically in browser: `http://localhost:5680`

3. **Gelişmiş Başlatıcı | Advanced Launcher:**
   - `WhatsApp-Chat-Viewer-Baslatici.bat` kullanın
   - Bağımlılık kontrolü ve güncelleme yapar
   - Use `WhatsApp-Chat-Viewer-Baslatici.bat`
   - Checks and updates dependencies

### Manuel Kurulum | Manual Installation

```bash
# Bağımlılıkları yükle | Install dependencies
npm install

# Uygulamayı başlat | Start the application
npm run dev

# Tarayıcıda aç | Open in browser
# http://localhost:5680
```

## 📁 WhatsApp Sohbetini Dışa Aktarma | How to Export WhatsApp Chat

1. WhatsApp'ta sohbeti açın | Open the chat in WhatsApp
2. ⋮ (üç nokta) menüsüne tıklayın | Click ⋮ (three dots) menu
3. "Diğer" > "Sohbeti dışa aktar" | "More" > "Export chat"
4. "Medya dahil et" seçeneğini seçin | Choose "Include media"
5. ZIP dosyasını bilgisayarınıza kaydedin | Save ZIP file to your computer
6. Uygulamada ZIP dosyasını sürükle-bırak yapın | Drag & drop ZIP file in the app

## ✨ Yeni Özellikler | New Features

- 🇹🇷 **Tam Türkçe Lokalizasyon** | Full Turkish Localization
- 🎵 **Ses Dosyası Önizleme** | Audio File Preview  
- 🎬 **Video Oynatma** | Video Playback
- 🔗 **Tıklanabilir Linkler** | Clickable Links
- 📧 **Email Desteği** | Email Support
- 🖱️ **Drag & Drop** | Drag & Drop Support
- 📱 **Mobil Uyumlu** | Mobile Responsive

## 🤝 Katkıda Bulunma | Contributing

Katkılarınızı memnuniyetle karşılıyoruz! | Contributions are welcome!

### 🔄 Development Workflow
1. Repository'yi fork edin | Fork the repository
2. Feature branch oluşturun | Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin | Commit your changes (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin | Push to the branch (`git push origin feature/amazing-feature`)
5. Pull Request açın | Open a Pull Request

### 🐛 Bug Raporları | Bug Reports
Bir hata bulduysanız, lütfen GitHub Issues'da detaylı bir rapor oluşturun:
- Hata açıklaması | Bug description
- Tekrarlama adımları | Steps to reproduce
- Beklenen davranış | Expected behavior
- Ekran görüntüleri (varsa) | Screenshots (if applicable)
- Sistem bilgileri | System information

## 📄 Lisans | License

Bu proje MIT Lisansı altında lisanslanmıştır. | This project is licensed under the MIT License.

## 💝 Destekle | Support

Bu projeyi beğendiyseniz | If you like this project:
- ⭐ GitHub'da yıldız verin | Star it on GitHub
- 🐛 Hata bulursanız rapor edin | Report bugs if you find any
- 🚀 Yeni özellik önerilerinizi paylaşın | Share your feature suggestions
- 🔄 Arkadaşlarınızla paylaşın | Share with your friends

## 📞 İletişim | Contact

- **Geliştirici | Developer**: Fatih Eke
- **GitHub**: [@exedesign](https://github.com/exedesign)
- **Proje Link | Project Link**: [whatsapp-chat-viewer-tr](https://github.com/exedesign/whatsapp-chat-viewer-tr)

---

<div align="center">

**Made with ❤️ in Turkey**

*WhatsApp sohbetlerinizi güvenli ve modern bir şekilde görüntüleyin!*  
*View your WhatsApp chats safely and modernly!*

**Note**: This app functions completely offline and all data is parsed locally in your browser.  
**Not**: Bu uygulama tamamen çevrimdışı çalışır ve tüm veriler tarayıcınızda yerel olarak işlenir.

---

## 🖥️ Windows Masaüstü (Electron) Paketleme | Windows Desktop Packaging

Uygulamayı bağımsız Windows masaüstü uygulaması olarak paketleyebilirsiniz.

### 🔨 Gerekli Ek Bağımlılıklar | Extra Dev Dependencies
`electron`, `electron-packager`, `electron-winstaller`, `concurrently`, `wait-on`

Kurulu değilse:
```bash
npm install --save-dev electron electron-packager electron-winstaller concurrently wait-on
```

### 📦 Portable (Klasör) Oluşturma
```bash
npm run pack-win-portable
```
Çıktı klasörü: `portable/WhatsApp Chat Viewer TR-win32-x64/`

### 🧙 Installer (Setup.exe) Oluşturma
```bash
npm run installer
```
Oluşan dosyalar: `installer/WhatsAppChatViewerTR-Setup-<version>.exe`

### 📜 Onefile (Self-Extract SFX) Oluşturma
Önce portable üretir sonra 7-Zip SFX oluşturur (7z.exe PATH'te olmalı):
```bash
npm run onefile
```
Çıktı: `onefile/WhatsAppChatViewerTR-OneFile.exe`

### 🌐 GitHub Release Yayınlama Önerisi
1. `npm run pack-win-portable` ve `npm run installer` çalıştır
2. Portable klasörünü .zip yap: `WhatsAppChatViewerTR-portable.zip`
3. `WhatsAppChatViewerTR-Setup-<version>.exe` ve (opsiyonel) `WhatsAppChatViewerTR-OneFile.exe` dosyalarını GitHub Releases -> Draft new release ekranına sürükle bırak
4. Release notlarına özet ekle:
   - Added: Türkçe arayüz, medya önizleme, portable & installer
   - Checksums (opsiyonel)

### 🧪 Test Kontrol Listesi | QA Checklist
- [ ] Portable klasörde exe açılıyor mu?
- [ ] İnternet kapalıyken sohbet açma başarılı mı? (offline garanti)
- [ ] Drag & drop ZIP çalışıyor mu?
- [ ] Medya (jpg/mp4/opus) açılıyor mu?
- [ ] Installer ile kur → Başlat menüsünden çalışıyor mu?
- [ ] Uninstall sonrası config/artık dosya kalmıyor mu? (Beklenen: yok)
- [ ] Onefile exe double-click → hedef klasöre açıp uygulamayı başlatıyor mu?

### 🔧 Özelleştirme (İkon)
`icon.ico` kök dizindedir. Değiştirmek için aynı isimle güncelleyin ve:
```bash
npm run pack-win-portable
npm run installer
```

### ⚠️ Notlar
- Büyük binary dosyalar git deposuna eklenmez (.gitignore). Yalnızca Release Assets olarak yükleyin.
- Tek dosya SFX memory’den direkt çalıştırmaz; geçici klasöre açar (standart davranış).
- İsteğe bağlı kod imzalama (code signing) eklenmemiştir.

---

</div>

## 🔄 Otomatik Güncelleme | Auto Update (Basit Kontrol)

Bu proje tam otomatik (arka planda indirip kuran) bir güncelleme yerine hafif bir "sürüm denetimi" mekanizması içerir.

### Nasıl Çalışır?
- Uygulama açıldıktan ~3 saniye sonra (production modda) GitHub Releases üzerinden son yayımlanan etiketi çeker.
- Eğer mevcut sürümden (package.json) daha yeni bir tag bulunursa bilgi kutusu gösterir.
- Kullanıcı "İndir" butonuna tıklarsa varsayılan tarayıcıda ilgili Release sayfası açılır.
- Manuel tetikleme için menüde: Dosya → "Güncellemeleri Denetle".

### Sürüm Karşılaştırması
`vMAJOR.MINOR.PATCH` biçimindeki tag adları (ör: `v3.1.0`) karşılaştırılır. Tag önünde `v` harfi opsiyoneldir fakat tavsiye edilir.

### Release Hazırlarken
1. `git tag vX.Y.Z` & `git push --tags`
2. GitHub’da Release oluşturun veya tag push sonrası "Draft new release" butonunu kullanın
3. Release notlarını doldurun (CHANGELOG.md referans alınabilir)
4. İsteğe bağlı: Portable zip / Installer exe / Onefile exe ekleyin.

### Sınırlar / Notlar
- Arka planda otomatik indirme ve delta update yapılmaz (Squirrel entegre edilmedi).
- Ağ hatalarında sessizce devam eder; yalnızca manuel kontrolde hata diyalogu gösterilir.
- Code signing yoksa bazı Windows SmartScreen uyarıları görülebilir.

### Geliştirme İçin Öneri (İleride)
- Gerçek auto-updater için: `electron-updater` + GitHub Releases / S3
- Diferansiyel güncelleme: Squirrel.Windows veya electron-builder publish pipeline
- İmzalama: Windows için Authenticode sertifikası

---