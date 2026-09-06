require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const { sendWhatsappOtp, DEMO_MODE } = require("./whatsapp");

const app = express();
app.use(cors());
app.use(express.json());

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutos
const MAX_ATTEMPTS_PER_HOUR = 5;

function normalizePhone(phone) {
  return (phone || "").replace(/[^\d+]/g, "");
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos
}

// ---------- POST /api/send-otp ----------
// Recibe { telefono } y envía un código por WhatsApp.
app.post("/api/send-otp", async (req, res) => {
  try {
    const phone = normalizePhone(req.body.telefono);
    if (!phone || phone.length < 8) {
      return res.status(400).json({ error: "Número de teléfono inválido." });
    }

    // límite simple de solicitudes por número en la última hora
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recientes = db
      .prepare("SELECT COUNT(*) AS n FROM otp_codes WHERE phone = ? AND created_at > ?")
      .get(phone, oneHourAgo);

    if (recientes.n >= MAX_ATTEMPTS_PER_HOUR) {
      return res.status(429).json({ error: "Demasiados intentos. Intenta más tarde." });
    }

    const code = generateCode();
    const now = Date.now();
    const { numeroAsignado } = await sendWhatsappOtp(phone, code);

    db.prepare(
      "INSERT INTO otp_codes (phone, code, expires_at, created_at, numero_asignado) VALUES (?, ?, ?, ?, ?)"
    ).run(phone, code, now + OTP_TTL_MS, now, numeroAsignado ?? null);

    res.json({
      ok: true,
      demo: DEMO_MODE,
      // en modo demo devolvemos el código para poder probar sin WhatsApp real
      ...(DEMO_MODE ? { demoCode: code } : {}),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo enviar el código." });
  }
});

// ---------- POST /api/verify-otp ----------
// Recibe { telefono, codigo } y confirma si es válido.
app.post("/api/verify-otp", (req, res) => {
  const phone = normalizePhone(req.body.telefono);
  const codigo = String(req.body.codigo || "");

  const row = db
    .prepare(
      "SELECT * FROM otp_codes WHERE phone = ? AND code = ? ORDER BY created_at DESC LIMIT 1"
    )
    .get(phone, codigo);

  if (!row) {
    return res.status(400).json({ error: "Código incorrecto." });
  }
  if (row.expires_at < Date.now()) {
    return res.status(400).json({ error: "El código expiró, solicita uno nuevo." });
  }

  db.prepare("UPDATE otp_codes SET verified = 1 WHERE id = ?").run(row.id);

  res.json({ ok: true });
});

// ---------- POST /api/leads ----------
// Guarda el lead ya con el teléfono verificado.
app.post("/api/leads", (req, res) => {
  const { nombre, telefono, facebook, servicio, codigo } = req.body;
  const phone = normalizePhone(telefono);

  const verificado = db
    .prepare(
      "SELECT * FROM otp_codes WHERE phone = ? AND code = ? AND verified = 1 ORDER BY created_at DESC LIMIT 1"
    )
    .get(phone, String(codigo || ""));

  if (!verificado) {
    return res.status(400).json({ error: "El teléfono no está verificado." });
  }

  db.prepare(
    `INSERT INTO leads (nombre, telefono, facebook, servicio, numero_asignado, telefono_verificado, created_at)
     VALUES (?, ?, ?, ?, ?, 1, ?)`
  ).run(nombre, phone, facebook || null, servicio || null, verificado.numero_asignado, Date.now());

  res.json({ ok: true });
});

// ---------- GET /api/leads ----------
// Panel simple para que el negocio revise los leads entrantes.
app.get("/api/leads", (req, res) => {
  const leads = db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
  res.json(leads);
});

// ---------- PATCH /api/leads/:id/revisado ----------
// Marca un lead como revisado (después de chequear el Facebook manualmente).
app.patch("/api/leads/:id/revisado", (req, res) => {
  db.prepare("UPDATE leads SET revisado = 1 WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}${DEMO_MODE ? " (modo DEMO — sin credenciales de WhatsApp)" : ""}`);
});
