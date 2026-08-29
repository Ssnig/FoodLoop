@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ========================================
echo  FoodLoop Frontend
echo  n8n skipped (assumed already running)
echo ========================================
echo.

if not exist "Frontend\node_modules\" (
  echo [install] Frontend...
  pushd Frontend
  call npm install
  if errorlevel 1 goto :fail
  popd
) else (
  echo [ok] Frontend node_modules present
)

echo.
echo [start] Frontend -^> http://localhost:5173
echo n8n (cloud): https://kyawsanhtun.app.n8n.cloud
echo Rescue webhook: https://kyawsanhtun.app.n8n.cloud/webhook/foodloop-rescue-created
echo.
echo Close this window to stop the app.
echo.

cd /d "%~dp0Frontend"
REM Port comes from vite.config.ts — do NOT pass "--port 5173" via npm
REM (newer npm can turn that into "vite 5173" and break the app).
call npm run dev
exit /b %errorlevel%

:fail
echo.
echo Install failed. Fix npm errors above, then re-run run.cmd.
pause
exit /b 1
