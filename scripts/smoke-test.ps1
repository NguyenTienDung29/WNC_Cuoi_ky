param([string]$BaseUrl = 'http://localhost:3000')
$ErrorActionPreference = 'Stop'
Write-Host "===== SportHub Smoke Test =====" -ForegroundColor Cyan
try {
  $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get
  if ($health.status -ne 'ok' -or $health.database -ne 'connected') { throw "Health check không đạt" }
  Write-Host "PASS - API /health kết nối database" -ForegroundColor Green
  $stats = Invoke-RestMethod -Uri "$BaseUrl/api/stats" -Method Get
  Write-Host "PASS - Thống kê: $($stats.events) sự kiện, $($stats.members) thành viên" -ForegroundColor Green
  $events = Invoke-RestMethod -Uri "$BaseUrl/api/events" -Method Get
  if (@($events.events).Count -lt 1) { throw 'Danh sách sự kiện đang rỗng' }
  Write-Host "PASS - Danh sách có $(@($events.events).Count) sự kiện" -ForegroundColor Green
  $first = $events.events[0].id
  $detail = Invoke-RestMethod -Uri "$BaseUrl/api/events/$first" -Method Get
  if ($detail.event.id -ne $first) { throw 'Chi tiết sự kiện không hợp lệ' }
  Write-Host "PASS - Xem chi tiết sự kiện #$first" -ForegroundColor Green
  Write-Host 'Các kiểm thử cơ bản đã đạt. Tiếp tục kiểm thử UI/auth/admin theo docs/KIEM_THU.md' -ForegroundColor Green
} catch {
  Write-Host "FAIL - $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
