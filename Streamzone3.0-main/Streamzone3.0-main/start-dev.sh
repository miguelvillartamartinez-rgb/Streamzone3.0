#!/bin/bash
echo "🚀 Iniciando servidor Express en puerto 4000..."
node -e "import('./src/server.ts')" &
EXPRESS_PID=$!

sleep 3

echo "🚀 Iniciando servidor Angular..."
ng serve

# Limpiar al salir
trap "kill $EXPRESS_PID" EXIT




