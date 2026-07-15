@echo off
setlocal
if exist "C:\nvm4w\nodejs\node.exe" set "PATH=C:\nvm4w\nodejs;%APPDATA%\npm;%PATH%"
cd /d "%~dp0tools\ControlSysEqui"
node server.js --open
