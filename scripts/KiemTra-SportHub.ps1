#requires -Version 5.1
$ErrorActionPreference='Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
$port=3000
if(Test-Path '.env') {
 $line=Get-Content '.env' | Where-Object {$_ -match '^APP_PORT='} | Select-Object -First 1
 if($line) { $port=[int]($line -split '=',2)[1] }
}
Write-Host "URL kiem thu: http://localhost:$port" -ForegroundColor Cyan
docker compose ps
if($LASTEXITCODE -ne 0){throw 'Docker Compose khong hoat dong.'}
$paths=@('/health','/api/meta','/api/events','/api/stats','/api/resources')
foreach($path in $paths){
 try {
  $result=Invoke-RestMethod -Uri "http://localhost:$port$path" -TimeoutSec 12
  Write-Host "PASS $path" -ForegroundColor Green
  if($path -eq '/api/events'){Write-Host "So su kien: $($result.events.Count)"}
  if($path -eq '/api/meta'){Write-Host "Database: $($result.events) su kien, $($result.demo_events) mau"}
 } catch {
  Write-Host "FAIL $path : $($_.Exception.Message)" -ForegroundColor Red
  Write-Host 'Xem: docker compose logs --tail 100 api' -ForegroundColor Yellow
 }
}
