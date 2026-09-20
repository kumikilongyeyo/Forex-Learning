@echo off
cd /d %~dp0
start "Forex Lab PH server" /B node scripts\serve.mjs
timeout /t 1 /nobreak >nul
start "" http://127.0.0.1:4173
