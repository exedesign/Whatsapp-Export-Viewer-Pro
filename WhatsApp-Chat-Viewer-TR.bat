@echo off
chcp 65001 >nul
title WhatsApp Chat Viewer TR - Yaratici: Fatih Eke
color 0A

echo.
echo ███████████████████████████████████████████████████
echo █                                                 █
echo █        WhatsApp Chat Viewer TR v2.0.0          █
echo █                                                 █
echo █        Yaratici: Fatih Eke © 2025               █
echo █        Tamamen Çevrimdışı Çalışır               █
echo █                                                 █
echo ███████████████████████████████████████████████████
echo.

rem Proje dizinine geç
cd /d "%~dp0"

rem Node.js kontrolü
echo [1/4] Node.js kontrol ediliyor...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ HATA: Node.js bulunamadi!
    echo.
    echo Çözüm:
    echo 1. https://nodejs.org adresine gidin
    echo 2. LTS versiyonunu indirin ve kurun
    echo 3. Bilgisayarınızı yeniden başlatın
    echo 4. Bu dosyayı tekrar çalıştırın
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js bulundu

rem Package.json kontrolü
echo [2/4] Proje dosyaları kontrol ediliyor...
if not exist "package.json" (
    echo ❌ HATA: package.json bulunamadi!
    echo Bu dosyayı proje klasöründe çalıştırın.
    pause
    exit /b 1
)
echo ✅ Proje dosyaları tamam

rem Bağımlılık kontrolü ve kurulumu
echo [3/4] Bağımlılıklar kontrol ediliyor...
if not exist "node_modules" (
    echo 📦 İlk kurulum yapılıyor...
    echo Bu işlem 2-5 dakika sürebilir, lütfen bekleyin...
    echo.
    npm install --silent
    if errorlevel 1 (
        echo.
        echo ❌ HATA: Bağımlılıkları yüklerken hata oluştu!
        echo İnternet bağlantınızı kontrol edin ve tekrar deneyin.
        echo.
        pause
        exit /b 1
    )
    echo ✅ İlk kurulum tamamlandı
) else (
    echo ✅ Bağımlılıklar mevcut
)

rem Uygulama başlatma
echo [4/4] Uygulama başlatılıyor...
echo.
echo ================================================
echo   🚀 WhatsApp Chat Viewer TR Başlatılıyor...
echo   🌐 Web Adresi: http://localhost:5680
echo   ⏹️  Durdurmak için: Ctrl+C
echo ================================================
echo.
echo 💡 İpucu: WhatsApp sohbet ZIP dosyanızı 
echo    tarayıcıya sürükle-bırak yapabilirsiniz!
echo.

rem 3 saniye bekle ve tarayıcıyı aç
timeout /t 3 /nobreak >nul
start "" "http://localhost:5680" 2>nul

rem Web sunucusunu başlat
npm run dev

echo.
echo 👋 Uygulama kapatıldı. Teşekkür ederiz!
pause