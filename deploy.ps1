# Limpiar la carpeta de build vieja
Write-Host "🔹 Limpiando carpeta dist/pisapisuela-app..."
if (Test-Path "dist\pisapisuela-app") {
    Remove-Item -Recurse -Force "dist\pisapisuela-app"
    Write-Host "✅ Carpeta limpia."
} else {
    Write-Host "ℹ️ No existía carpeta dist/pisapisuela-app."
}

# Hacer build SPA (producción)
Write-Host "🔹 Compilando Angular en modo producción (SPA)..."
ng build --configuration production --output-path=dist/pisapisuela-app --no-prerender
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "✅ Build completado. Archivos generados en dist/pisapisuela-app"

# Desplegar a Firebase Hosting
Write-Host "🔹 Desplegando a Firebase Hosting..."
firebase deploy --only hosting
if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deploy completado. Tu app debería estar disponible en:"
    Write-Host "https://venta-uniformes-cf577.web.app"
} else {
    Write-Error "❌ Error durante el deploy. Revisa los logs de Firebase."
}
