// ---------- Config ----------
// Los 2 números del negocio. Cada clic en un botón de WhatsApp elige uno
// al azar, para repartir parejo la carga de conversaciones entre ambos.
const WHATSAPP_NUMBERS = ["529851020890", "529811017353"];

function buildWhatsappLink(message) {
  const text = encodeURIComponent(message || "Hola, quiero información sobre los servicios.");
  const numero = WHATSAPP_NUMBERS[Math.floor(Math.random() * WHATSAPP_NUMBERS.length)];
  return `https://wa.me/${numero}?text=${text}`;
}

// ---------- Ember particles (ambient signature effect) ----------
(function emberField() {
  const field = document.querySelector(".ember-field");
  if (!field) return;
  const COUNT = 22;

  for (let i = 0; i < COUNT; i++) {
    const ember = document.createElement("span");
    ember.className = "ember";
    const left = Math.random() * 100;
    const duration = 8 + Math.random() * 10;
    const delay = Math.random() * 12;
    const drift = (Math.random() * 60 - 30).toFixed(0) + "px";

    ember.style.left = left + "vw";
    ember.style.animationDuration = duration + "s";
    ember.style.animationDelay = delay + "s";
    ember.style.setProperty("--drift", drift);

    field.appendChild(ember);
  }
})();

// ---------- WhatsApp CTAs ----------
document.querySelectorAll("#headerWhatsapp, .whatsapp-float, #redesWhatsapp, #contactoWhatsapp").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    window.open(buildWhatsappLink(), "_blank", "noopener");
  });
});

// ---------- Redes sociales ----------
// TODO: reemplazar "#" por las URLs reales una vez el cliente cree las
// cuentas de Facebook, Instagram y YouTube del negocio.
// document.querySelector('[data-red="facebook"]').href = "https://facebook.com/...";
// document.querySelector('[data-red="instagram"]').href = "https://instagram.com/...";
// document.querySelector('[data-red="youtube"]').href = "https://youtube.com/...";
