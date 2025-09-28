param(
  [string]$SourceDir = "portable/WhatsApp Chat Viewer TR-win32-x64",
  [string]$OutDir = "onefile",
  [string]$Product = "WhatsAppChatViewerTR-OneFile"
)
if (-not (Test-Path $SourceDir)) { Write-Error "SourceDir yok. Önce npm run pack-win-portable"; exit 1 }
if (-not (Get-Command 7z.exe -ErrorAction SilentlyContinue)) { Write-Error "7z.exe PATH'te değil"; exit 1 }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$archive = Join-Path $OutDir "$Product.7z"
$sfx = Join-Path $OutDir "$Product.exe"
$config = "scripts/make-sfx-config.txt"
if (Test-Path $archive) { Remove-Item $archive -Force }
if (Test-Path $sfx) { Remove-Item $sfx -Force }
Write-Host '-> Arşivleniyor'
7z a -t7z -mx=9 $archive "$SourceDir/*" | Out-Null
$sfxModule = (Get-Command 7z.exe).Source.Replace('7z.exe','7z.sfx')
if (-not (Test-Path $sfxModule)) { Write-Error '7z.sfx bulunamadı'; exit 1 }
Write-Host '-> SFX oluşturuluyor'
Get-Content $sfxModule -Encoding Byte | Set-Content -Encoding Byte $sfx
Get-Content $config -Encoding Byte | Add-Content -Encoding Byte $sfx
Get-Content $archive -Encoding Byte | Add-Content -Encoding Byte $sfx
Write-Host "✓ Tek dosya hazır: $sfx"
