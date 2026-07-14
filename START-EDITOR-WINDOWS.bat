@echo off
setlocal
title Salvage Fisherman's Museum Website Editor

cd /d "%~dp0"

echo ============================================================
echo Salvage Fisherman's Museum Website Editor
echo ============================================================
echo.
echo This window needs to stay open while staff use the editor.
echo.
echo Website folder:
echo %CD%
echo.

if not exist "museum-editor-server.js" (
  echo PROBLEM:
  echo I cannot find museum-editor-server.js in this folder.
  echo.
  echo This file must be inside the main website folder, beside:
  echo index.html
  echo staff-editor.html
  echo museum-editor-server.js
  echo.
  echo Move START-EDITOR-WINDOWS.bat into the main website folder and try again.
  echo.
  pause
  exit /b 1
)

if not exist "staff-editor.html" (
  echo PROBLEM:
  echo I cannot find staff-editor.html in this folder.
  echo.
  echo The editor files may not have copied to this computer correctly.
  echo.
  pause
  exit /b 1
)

if not exist "index.html" (
  echo PROBLEM:
  echo I cannot find index.html in this folder.
  echo.
  echo This does not look like the main website folder.
  echo.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo PROBLEM:
  echo Node.js is not installed on this computer, or Windows cannot find it.
  echo.
  echo Install the LTS version from:
  echo https://nodejs.org/
  echo.
  echo After installing Node.js, restart the computer, then double-click this file again.
  echo.
  pause
  exit /b 1
)

echo Node.js found:
node --version
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4173" ^| findstr "LISTENING"') do (
  echo Closing old editor process %%a...
  taskkill /PID %%a /F >nul 2>nul
)

echo Starting editor...
echo.
echo If the browser does not open automatically, copy this into the browser:
echo http://localhost:4173/editor
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul && start "" "http://localhost:4173/editor""
node museum-editor-server.js

echo.
echo ============================================================
echo The editor stopped.
echo ============================================================
echo.
echo If you see an error above, take a photo or screenshot and send it to Molly/Codex.
echo.
pause
