#requires -Version 5.1
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
function New-Secret {
  $bytes = New-Object byte[] 32
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  return [BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw 'Khong tim thay docker.exe. Cai Docker Desktop va mo lai PowerShell.'
}
# Tranh tao mat khau ngau nhien khac voi PostgreSQL volume cu.
if (-not (Test-Path '.env')) {
  try {
    $volumes = @(docker volume ls --format '{{.Name}}' 2>$null)
    if ($volumes -contains 'sporthub_sporthub_pgdata') {
      throw 'Phat hien volume sporthub_sporthub_pgdata cua ban cu ma khong co .env. Hay COPY .env cu vao thu muc moi truoc khi chay, de giu credential va du lieu. Xem docs/KHAC_PHUC_LOI_500.md.'
    }
  } catch {
    if ($_.Exception.Message -match 'Phat hien volume') { throw }
    Write-Host 'Khong the kiem tra Docker volume, hay bao dam Docker Engine running.' -ForegroundColor Yellow
  }
  $content = Get-Content '.env.example' -Raw
  $content = $content.Replace('replace_with_private_db_password', (New-Secret))
  $content = $content.Replace('replace_with_random_string_32_characters_minimum', (New-Secret))
  $content = $content.Replace('replace_with_private_admin_password', (New-Secret))
  $encoding = [System.Text.UTF8Encoding]::new($false)
  [System.IO.File]::WriteAllText((Join-Path (Get-Location) '.env'), $content, $encoding)
  Write-Host 'Da tao .env voi cac secret ngau nhien. Xem ADMIN_PASSWORD trong .env de dang nhap.' -ForegroundColor Green
} else {
  Write-Host '.env da ton tai, GIU NGUYEN cau hinh va du lieu.' -ForegroundColor Yellow
}
Write-Host 'Dang kiem tra Docker Engine...'
docker info --format '{{.ServerVersion}}' | Out-Host
if ($LASTEXITCODE -ne 0) { throw 'Docker Engine chua chay. Mo Docker Desktop -> Engine running.' }
Write-Host 'Dang kiem tra Compose...'
docker compose config --quiet
if ($LASTEXITCODE -ne 0) { throw 'Cau hinh compose.yaml khong hop le.' }
Write-Host 'Khoi dong 3 container...'
docker compose up --build -d
if ($LASTEXITCODE -ne 0) { throw 'Khong the build/khai chay Compose. Kiem tra docker compose logs.' }
docker compose ps
Write-Host 'Web: http://localhost:<APP_PORT trong .env>, mac dinh 3000' -ForegroundColor Green
Write-Host 'API: http://localhost:3000/health ; http://localhost:3000/api/events' -ForegroundColor Green
Write-Host 'API direct cho Vite: http://127.0.0.1:4000/health' -ForegroundColor Green
Write-Host 'Neu da co du lieu, container se giu nguyen PostgreSQL volume.' -ForegroundColor Green
