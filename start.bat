@echo off
cd /d "%~dp0"
title CODE LADDER

netstat -ano | findstr /C:":3000" >nul
if not errorlevel 1 goto already_running

set "NODE_BIN="
where node >nul 2>nul
if not errorlevel 1 set "NODE_BIN=node"
if not defined NODE_BIN if exist "D:\nodejs\node.exe" set "NODE_BIN=D:\nodejs\node.exe"
if not defined NODE_BIN if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_BIN=%ProgramFiles%\nodejs\node.exe"
if not defined NODE_BIN goto no_node

echo.
echo  Starting CODE LADDER...
echo  A server window will open. Close it to stop the service.
echo.
start "CodeLadder Server" /D "%~dp0" "%NODE_BIN%" server.js
ping -n 3 127.0.0.1 >nul
start "" "http://localhost:3000"
echo  Opened http://localhost:3000 in your browser.
echo  If it did not open, visit the address manually.
ping -n 6 127.0.0.1 >nul
exit /b 0

:already_running
echo.
echo  CODE LADDER is already running at http://localhost:3000
echo.
start "" "http://localhost:3000"
ping -n 4 127.0.0.1 >nul
exit /b 0

:no_node
echo.
echo  Node.js was not found.
echo  Please install Node.js from https://nodejs.org/ and try again.
echo.
pause
exit /b 1
