const axios = require("axios");

// Envío de mensajes vía WhatsApp Business API (Meta Cloud API).
// El negocio maneja varios números bajo la misma cuenta de Meta Business (WABA).
// En .env se configuran como una lista separada por comas, ej:
//   WHATSAPP_TOKEN=...
//   WHATSAPP_PHONE_NUMBER_IDS=id_numero_1,id_numero_2,id_numero_3
//
// Se reparten los leads en rotación automática (round-robin): cada solicitud
// nueva usa el siguiente número de la lista, para no saturar uno solo.
//
// Mientras no haya credenciales, el modo DEMO deja ver el código en la
// consola del servidor en vez de enviarlo, para probar el flujo sin Meta.

const PHONE_NUMBER_IDS = (process.env.WHATSAPP_PHONE_NUMBER_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

const DEMO_MODE = !process.env.WHATSAPP_TOKEN || PHONE_NUMBER_IDS.length === 0;

let rotationIndex = 0;

// Elige el siguiente número de la lista en rotación y devuelve su índice
// junto con el id, para poder guardar cuál número atendió cada lead.
function nextPhoneNumberId() {
  if (PHONE_NUMBER_IDS.length === 0) return { index: 0, id: null };
  const index = rotationIndex % PHONE_NUMBER_IDS.length;
  rotationIndex += 1;
  return { index, id: PHONE_NUMBER_IDS[index] };
}

async function sendWhatsappOtp(phone, code) {
  const { index, id } = nextPhoneNumberId();

  if (DEMO_MODE) {
    console.log(`[DEMO] Código OTP para ${phone}: ${code} (número asignado: #${index + 1})`);
    return { demo: true, numeroAsignado: index };
  }

  const url = `https://graph.facebook.com/v20.0/${id}/messages`;

  const { data } = await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: `Tu código de verificación es: ${code}. Vence en 5 minutos.` },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  return { ...data, numeroAsignado: index };
}

module.exports = { sendWhatsappOtp, DEMO_MODE, PHONE_NUMBER_IDS };
