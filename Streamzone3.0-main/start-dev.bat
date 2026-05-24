@echo off
echo Iniciando servidor Express en puerto 4000...
start "Servidor Express" cmd /k "node -e \"import('./src/server.ts')\""

timeout /t 3 /nobreak >nul

echo Iniciando servidor Angular...
ng serve




