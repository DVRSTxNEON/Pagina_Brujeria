# Comandos para subir el backend a GitHub

Ejecuta esto desde dentro de la carpeta `pagina-brujeria-backend/` en tu computador:

```bash
git init
git add .
git commit -m "Backend inicial: verificacion OTP y guardado de leads"
git branch -M main
git remote add origin https://github.com/DVRSTxNEON/Pagina_Brujeria.git
git push -u origin main
```

Si el repo en GitHub ya tiene algo (README, licencia, etc.) y el push falla por conflicto, corre primero:

```bash
git pull origin main --allow-unrelated-histories
```

y luego resuelve cualquier conflicto antes de volver a hacer `git push`.
