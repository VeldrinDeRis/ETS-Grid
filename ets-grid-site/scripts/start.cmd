@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Для перегляду потрібен Node.js 22 або новіший: https://nodejs.org
  pause
  exit /b 1
)
echo Запускаю мокап ETS GRID. Закрийте це вікно, щоб зупинити.
node serve.mjs --open
pause
