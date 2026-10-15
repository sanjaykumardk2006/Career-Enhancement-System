@echo off
title Career Enhancement System Launcher
echo ================================================================
echo   Career Enhancement System - Starting Services
echo ================================================================
echo.

set ROOT_DIR=%~dp0

echo [1/2] Launching Backend Server (Port 5000)...
start "CareerAI - Backend (Port 5000)" cmd /k "cd /d ""%ROOT_DIR%backend"" && npm run dev"

echo [2/2] Launching Frontend Server (Port 5173)...
start "CareerAI - Frontend (Port 5173)" cmd /k "cd /d ""%ROOT_DIR%frontend"" && npm run dev"

echo.
echo ================================================================
echo   Both Backend and Frontend have been launched!
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ================================================================
