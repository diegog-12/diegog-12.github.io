/* =========================================================
   Contexto — DATOS DEL NEGOCIO
   Cambia aquí tus datos reales; toda la web los toma de este archivo.
   ========================================================= */

const SITE = {
    // Número de WhatsApp que recibe los pedidos: código de país + número, sin espacios ni "+".
    // ⚠️ Reemplázalo por tu número real antes de publicar.
    whatsapp: "51987654321",
    phoneDisplay: "+51 987 654 321",

    // Ubicación que ve el cliente (sé específico: pabellón, piso, referencia).
    address: "Campus Universitario",
    addressDetail: "",

    // Lo que escribirías en Google Maps para encontrar la cafetería.
    // Si lo dejas vacío, no se muestra el mapa ni el botón "Cómo llegar".
    mapsQuery: "",

    // Usuario de Instagram sin "@". Vacío = no se muestra.
    instagram: "",

    hours: [
        { days: "Lunes a sábado", time: "8:00 a. m. – 9:30 p. m." },
        { days: "Domingo", time: "Cerrado" },
    ],
};
