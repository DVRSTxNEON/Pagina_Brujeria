const Database = require("better-sqlite3");
const path = require("path");

// En Render, si usan un disco persistente, DB_PATH debe apuntar a esa
// carpeta montada (ej: /var/data/data.sqlite). Sin esa variable, cae en
// el archivo local — útil para desarrollo, pero en el plan gratuito de
// Render sin disco persistente los datos se pierden en cada reinicio.
const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "data.sqlite");

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0,
    numero_asignado INTEGER,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    facebook TEXT,
    servicio TEXT,
    numero_asignado INTEGER,
    telefono_verificado INTEGER NOT NULL DEFAULT 0,
    revisado INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
`);

module.exports = db;
