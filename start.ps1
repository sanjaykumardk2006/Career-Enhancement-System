Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Career Enhancement System - Starting Services" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

Write-Host "[1/2] Launching Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$rootDir\backend`" && npm run dev"

Write-Host "[2/2] Launching Frontend Server (Port 5173)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$rootDir\frontend`" && npm run dev"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  Both Backend and Frontend have been launched!" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
