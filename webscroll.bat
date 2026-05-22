@echo off

title WEBSITE SCROLL RECORDER

echo ===============================
echo    WEBSITE SCROLL RECORDER
echo ===============================
echo.

if not exist package.json (
    call npm init -y
)

if not exist node_modules (
    call npm install playwright
)

call npx playwright install

echo.
node scroll.js

echo.
pause