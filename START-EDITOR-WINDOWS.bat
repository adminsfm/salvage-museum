@echo off
<<<<<<< Updated upstream
setlocal
title Salvage Fisherman's Museum Website Editor

cd /d "%~dp0"

echo Starting the Salvage Fisherman's Museum website editor...
echo Website folder:
echo %CD%
=======
title Salvage Fisherman's Museum Website Editor
cd /d "%~dp0"

echo Starting the Salvage Fisherman's Museum website editor...
>>>>>>> Stashed changes
echo.
echo If the browser does not open, go to:
echo http://localhost:4173/editor
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed on this computer.
  echo.
  echo Please install Node.js LTS from:
  echo https://nodejs.org/
  echo.
  echo After installing Node.js, close this window and double-click this file again.
  echo.
  pause
  exit /b 1
)

<<<<<<< Updated upstream
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4173" ^| findstr "LISTENING"') do (
  echo Closing old editor process %%a...
  taskkill /PID %%a /F >nul 2>nul
)

timeout /t 1 /nobreak >nul

=======
>>>>>>> Stashed changes
start "" "http://localhost:4173/editor"
node museum-editor-server.js

echo.
echo The editor has stopped.
pause
