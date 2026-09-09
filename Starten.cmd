@echo off
cd /d "%~dp0"
echo Matheabenteuer oeffnen: http://127.0.0.1:4173
echo Dieses Fenster geoeffnet lassen, solange die Webseite genutzt wird.
node scripts/server.mjs
pause
