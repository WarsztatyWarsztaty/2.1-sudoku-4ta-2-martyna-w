@echo off
chcp 65001 >nul
title Sudoku Mistrz - Polska Aplikacja Pulpitowa
cd /d "%~dp0"

echo ===================================================================
echo               SUDOKU MISTRZ - Aplikacja Pulpitowa
echo ===================================================================
echo Trwa uruchamianie gry w dedykowanym oknie pulpitu...
echo.

:: 1. Próba uruchomienia przez Electron (pełne natywne okno desktopowe)
if exist "node_modules\electron" (
    echo [1/2] Uruchamianie za pośrednictwem Electron...
    call npm.cmd start
    if %ERRORLEVEL% EQU 0 goto :end
)

:: 2. Alternatywny tryb okna aplikacji pulpitu (Microsoft Edge / Chrome App Mode)
echo [2/2] Uruchamianie w oknie pulpitu Edge/Chrome App Mode...
set "HTML_PATH=%~dp0index.html"

if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="file:///%HTML_PATH%" --window-size=1080,860
    goto :end
)

if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app="file:///%HTML_PATH%" --window-size=1080,860
    goto :end
)

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="file:///%HTML_PATH%" --window-size=1080,860
    goto :end
)

:: 3. Ostateczny fallback - domyślna przeglądarka systemowa
echo Otwieranie w domyślnej przeglądarce...
start "" "%HTML_PATH%"

:end
echo Gotowe! Dobrej zabawy w Sudoku!
timeout /t 3 >nul
