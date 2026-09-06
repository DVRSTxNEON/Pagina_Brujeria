# Despliegue en Render

Este proyecto tiene dos partes que se despliegan por separado en Render:
1. **Backend** (`pagina-brujeria-backend/`) — servidor Node/Express con la verificación OTP
2. **Frontend** (`pagina-brujeria/`) — sitio estático (HTML/CSS/JS)

---

## 1. Backend

1. Sube la carpeta `pagina-brujeria-backend/` a un repositorio de GitHub (Render se conecta directo a GitHub).
2. En Render: **New +** → **Blueprint** → conecta el repo. Render detecta el archivo `render.yaml` y configura todo automático (incluye el disco persistente para que la base de datos no se borre al reiniciar).
   - Si prefieres configurarlo a mano en vez de usar el blueprint: **New +** → **Web Service**, runtime **Node**, build command `npm install`, start command `npm start`.
3. En la sección **Environment** del servicio, agrega:
   - `WHATSAPP_TOKEN` → el token de la app de Meta
   - `WHATSAPP_PHONE_NUMBER_IDS` → los IDs separados por coma (2 números en este caso), ej: `123456,234567`
   - (`DB_PATH` ya queda configurado por el blueprint apuntando al disco persistente)
4. Cuando termine el deploy, Render te da una URL como `https://pagina-brujeria-backend.onrender.com`. Guárdala, se necesita en el paso 2.

**Nota sobre el plan:** el plan gratuito de Render "duerme" el servidor tras 15 min sin uso (el primer mensaje después de eso tarda unos segundos en responder). Para un negocio que espera 5-6 clientes/semana ya vale la pena el plan pago básico (~$7 USD/mes) para que el formulario responda siempre al instante — es el ítem que ya venía cotizado.

---

## 2. Frontend

1. Antes de subirlo, cambia en `js/main.js` la línea:
   ```js
   const API_URL = "http://localhost:3001";
   ```
   por la URL real del backend del paso 1:
   ```js
   const API_URL = "https://pagina-brujeria-backend.onrender.com";
   ```
2. Sube la carpeta `pagina-brujeria/` a otro repo (o carpeta del mismo repo) en GitHub.
3. En Render: **New +** → **Static Site** → conecta el repo → build command vacío (no necesita build), publish directory `.` (o donde quede `index.html`).
4. Cuando termine, te da una URL tipo `https://pagina-brujeria.onrender.com` — ese es el sitio que apunta el dominio.

---

## 3. Conectar el dominio

1. En el servicio del **frontend** (Static Site) → **Settings** → **Custom Domains** → agrega el dominio comprado (ej. `nombredelnegocio.com`).
2. Render te da los registros DNS (tipo CNAME o A) que copias en el panel del registrador del dominio (Namecheap, Hostinger, etc.), como ya vimos antes.
3. El certificado SSL (`https://`) se activa automático una vez propague el DNS.

---

## Checklist antes de entregar

- [ ] `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_NUMBER_IDS` configurados en Render (no en el `.env` local)
- [ ] `API_URL` en `main.js` apunta a la URL real del backend, no a `localhost`
- [ ] Número de WhatsApp del botón flotante actualizado (ya no es el de relleno)
- [ ] Dominio conectado y HTTPS activo
- [ ] Probar el flujo completo desde el celular: llenar formulario → recibir código real por WhatsApp → verificar → redirige a WhatsApp
