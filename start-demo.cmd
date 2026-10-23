@echo off
rem Double-click to start both Jokerz demos, then open the homepage in your browser.
rem Close the two server windows to stop them.
cd /d "%~dp0"
start "Jokerz homepage :5180" cmd /k "cd /d homepage && npm.cmd run dev -- --host 127.0.0.1 --port 5180 --strictPort"
start "Jokerz static demo :5173" powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1 -Port 5173
timeout /t 6 /nobreak >nul
start "" http://127.0.0.1:5180/
