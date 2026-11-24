/* =========================================================
   Contexto — productos e ilustraciones
   Para usar una foto real en lugar de la ilustración, agrega
   photo: "img/mi-foto.png" (idealmente PNG con fondo transparente).
   ========================================================= */

const INK = 'stroke="#3D1A05" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';
const SHADOW = '<ellipse class="art-shadow" cx="160" cy="356" rx="118" ry="12" fill="#000" opacity=".2"/>';
const BRAND = (y, fill = "#3D1A05") =>
    `<text x="160" y="${y}" text-anchor="middle" font-family="Fraunces, Lora, serif" font-weight="800" font-size="24" fill="${fill}" stroke="none">Contexto</text>`;
const STEAM = (y) => `<g class="art-steam" fill="none" stroke="#FBF3E4" stroke-width="7" stroke-linecap="round">
        <path d="M126 ${y}c-14-18 14-30 0-50"/><path d="M160 ${y - 8}c-14-18 14-30 0-50"/><path d="M194 ${y}c-14-18 14-30 0-50"/></g>`;

const PRODUCT_ART = {
    espresso: `${SHADOW}${STEAM(146)}<g ${INK}>
        <ellipse cx="160" cy="320" rx="132" ry="28" fill="#FFF8EC"/>
        <ellipse cx="160" cy="314" rx="84" ry="13" fill="#EADBC3" stroke="none"/>
        <path d="M244 196c46-6 52 62 4 66" fill="none" stroke-width="18"/>
        <path d="M244 196c46-6 52 62 4 66" fill="none" stroke="#FFF8EC" stroke-width="7"/>
        <path d="M66 170h188v52c0 52-42 92-94 92s-94-40-94-92z" fill="#FFF8EC"/>
        <path d="M68 208h184v16H68z" fill="#E87A14" stroke="none"/>
        <path d="M66 170h188v52c0 52-42 92-94 92s-94-40-94-92z" fill="none"/>
        <ellipse cx="160" cy="170" rx="94" ry="22" fill="#FFF8EC"/>
        <ellipse cx="160" cy="172" rx="80" ry="15" fill="#A85A24" stroke="none"/>
        <path d="M114 173c22-10 58-11 90-1" fill="none" stroke="#D99A5B" stroke-width="6"/>
        ${BRAND(268)}</g>`,

    cappuccino: `${SHADOW}${STEAM(140)}<g ${INK}>
        <ellipse cx="160" cy="322" rx="136" ry="28" fill="#FFF8EC"/>
        <ellipse cx="160" cy="316" rx="88" ry="13" fill="#EADBC3" stroke="none"/>
        <path d="M262 192c48-4 50 62 0 64" fill="none" stroke-width="18"/>
        <path d="M262 192c48-4 50 62 0 64" fill="none" stroke="#E87A14" stroke-width="7"/>
        <path d="M44 172h232c-4 86-56 136-116 136S48 258 44 172z" fill="#E87A14"/>
        <ellipse cx="160" cy="172" rx="116" ry="24" fill="#FFF8EC"/>
        <ellipse cx="160" cy="174" rx="102" ry="17" fill="#F2DCB8" stroke="none"/>
        <path d="M160 188c-30-10-36-24-20-28 8-2 16 3 20 9 4-6 12-11 20-9 16 4 10 18-20 28z" fill="#B8692E" stroke="none"/>
        <g fill="#7A3F17" stroke="none"><circle cx="118" cy="170" r="2.5"/><circle cx="205" cy="168" r="2.5"/><circle cx="196" cy="182" r="2"/><circle cx="126" cy="182" r="2"/></g>
        ${BRAND(250, "#FFF8EC")}</g>`,

    latte: `${SHADOW}<defs><clipPath id="clipLatte"><path d="M96 92h128l-10 228c-1 14-12 22-24 22h-60c-12 0-23-8-24-22z"/></clipPath></defs>
        <g ${INK}>
        <path d="M220 158c56-2 58 112 2 114" fill="none" stroke-width="18"/>
        <path d="M220 158c56-2 58 112 2 114" fill="none" stroke="#F3E6D2" stroke-width="7"/>
        <g clip-path="url(#clipLatte)" stroke="none">
            <rect x="80" y="80" width="160" height="280" fill="#7A3F17"/>
            <path d="M80 80h160v170c-26 10-54-8-80 2s-54 8-80-2z" fill="#D9A86C"/>
            <path d="M80 80h160v74c-26 8-54-6-80 2s-54 6-80-2z" fill="#FBF0DC"/>
            <path d="M114 104l-8 210" stroke="#FFFFFF" stroke-width="9" opacity=".45"/>
        </g>
        <path d="M96 92h128l-10 228c-1 14-12 22-24 22h-60c-12 0-23-8-24-22z" fill="none"/>
        <ellipse cx="160" cy="92" rx="64" ry="10" fill="#FBF0DC"/>
        <g transform="translate(150 84)">
            <g fill="#FFFFFF" stroke-width="3"><ellipse cx="0" cy="-16" rx="9" ry="16"/><ellipse cx="0" cy="-16" rx="9" ry="16" transform="rotate(72)"/><ellipse cx="0" cy="-16" rx="9" ry="16" transform="rotate(144)"/><ellipse cx="0" cy="-16" rx="9" ry="16" transform="rotate(216)"/><ellipse cx="0" cy="-16" rx="9" ry="16" transform="rotate(288)"/></g>
            <circle r="7" fill="#F7B13C" stroke-width="3"/>
        </g>
        <path d="M196 70c10 6 18 20 20 36" fill="none" stroke="#4A2410" stroke-width="7"/>
        <rect x="40" y="300" width="46" height="40" rx="8" fill="#B5651D" transform="rotate(-10 63 320)"/>
        <path d="M50 306l26-4" stroke="#D88B45" stroke-width="5" transform="rotate(-10 63 320)"/>
        </g>`,

    coldbrew: `${SHADOW}<defs><clipPath id="clipBrew"><path d="M92 82h136l-12 240c-1 14-11 22-24 22h-64c-13 0-23-8-24-22z"/></clipPath></defs>
        <g ${INK}>
        <path d="M200 22l-26 130" fill="none" stroke-width="18"/>
        <path d="M200 22l-26 130" fill="none" stroke="#FFF8EC" stroke-width="9"/>
        <path d="M200 22l-26 130" fill="none" stroke="#E87A14" stroke-width="9" stroke-dasharray="12 12" stroke-linecap="butt"/>
        <g clip-path="url(#clipBrew)" stroke="none">
            <rect x="80" y="70" width="160" height="290" fill="#FFFFFF" opacity=".18"/>
            <rect x="80" y="118" width="160" height="240" fill="#4A1E0A"/>
            <ellipse cx="160" cy="118" rx="80" ry="9" fill="#7A3712"/>
            <g fill="#FFFFFF" opacity=".32" stroke="#FFFFFF" stroke-width="3">
                <rect x="104" y="134" width="44" height="40" rx="8" transform="rotate(-14 126 154)"/>
                <rect x="160" y="168" width="44" height="40" rx="8" transform="rotate(12 182 188)"/>
                <rect x="112" y="210" width="42" height="38" rx="8" transform="rotate(8 133 229)"/>
            </g>
            <path d="M112 100l-8 216" stroke="#FFFFFF" stroke-width="9" opacity=".45"/>
        </g>
        <path d="M92 82h136l-12 240c-1 14-11 22-24 22h-64c-13 0-23-8-24-22z" fill="none"/>
        <g transform="translate(226 96)">
            <circle r="46" fill="#F39A2B"/>
            <circle r="36" fill="#FFC067" stroke="none"/>
            <g stroke="#F39A2B" stroke-width="4"><path d="M0 0V-34"/><path d="M0 0V34"/><path d="M0 0H-34"/><path d="M0 0H34"/><path d="M0 0l24-24"/><path d="M0 0l-24 24"/><path d="M0 0l24 24"/><path d="M0 0l-24-24"/></g>
            <circle r="5" fill="#FFF1D6" stroke="none"/>
        </g></g>`,

    frappe: `${SHADOW}<g ${INK}>
        <path d="M188 14l-18 116" fill="none" stroke-width="18"/>
        <path d="M188 14l-18 116" fill="none" stroke="#E87A14" stroke-width="9"/>
        <path d="M90 142h140l-14 192c-1 12-9 18-19 18h-74c-10 0-18-6-19-18z" fill="#8B5A3C"/>
        <path d="M104 160l8 170M200 160l-6 120" stroke="#A97452" stroke-width="10" opacity=".8"/>
        <path d="M98 212h124l-4 66H102z" fill="#FFF8EC"/>
        <circle cx="160" cy="230" r="6" fill="#E87A14" stroke="none"/>
        ${BRAND(264)}
        <path d="M90 142h140l-14 192c-1 12-9 18-19 18h-74c-10 0-18-6-19-18z" fill="none"/>
        <path d="M84 134c4-62 148-62 152 0z" fill="#FFFFFF" fill-opacity=".45"/>
        <path d="M98 132c-6-24 18-32 28-20 2-24 32-28 40-8 8-20 38-14 38 8 14-8 30 4 22 20z" fill="#FFF8EC" stroke-width="4"/>
        <path d="M106 118c14-10 24 6 38-4s24 6 38-4 22 6 32-2" fill="none" stroke="#5C2809" stroke-width="6"/>
        <path d="M78 128h164v16H78z" fill="#FFFFFF"/>
        </g>`,

    cheesecake: `${SHADOW}<g ${INK}>
        <ellipse cx="160" cy="318" rx="142" ry="30" fill="#FFF8EC"/>
        <ellipse cx="160" cy="312" rx="102" ry="16" fill="#EADBC3" stroke="none"/>
        <path d="M40 270l244-34v24L40 296z" fill="#B5763A"/>
        <path d="M40 206l244-38v68L40 270z" fill="#FFF1D6"/>
        <path d="M40 190l244-40v20L40 210z" fill="#F2B705"/>
        <path d="M40 190l200-74 44 34z" fill="#F7C531"/>
        <path d="M120 186c0 14 8 18 8 26M196 174c0 18 10 20 8 30M256 166c0 10 6 14 4 22" fill="none" stroke="#F2B705" stroke-width="9"/>
        <g fill="#2B1A10" stroke="none"><ellipse cx="150" cy="160" rx="4" ry="3"/><ellipse cx="190" cy="148" rx="4" ry="3"/><ellipse cx="226" cy="140" rx="4" ry="3"/><ellipse cx="208" cy="156" rx="4" ry="3"/><ellipse cx="120" cy="172" rx="4" ry="3"/><ellipse cx="172" cy="164" rx="4" ry="3"/><ellipse cx="244" cy="152" rx="4" ry="3"/></g>
        <path d="M232 124c-6-22 10-36 32-34-2 22-14 36-32 34z" fill="#5C8F3E" stroke-width="4"/>
        <path d="M234 122l22-24" stroke="#3E6A2A" stroke-width="3"/>
        </g>`,

    brownie: `${SHADOW}<g ${INK}>
        <ellipse cx="160" cy="320" rx="146" ry="30" fill="#FFF8EC"/>
        <path d="M60 220l100-50 100 50-100 50z" fill="#7A4425"/>
        <path d="M60 220l100 50v70l-100-50z" fill="#5A2C12"/>
        <path d="M160 270l100-50v70l-100 50z" fill="#43200C"/>
        <path d="M90 165l70-35 70 35-70 35z" fill="#86502C"/>
        <path d="M90 165l70 35v55l-70-35z" fill="#5A2C12"/>
        <path d="M160 200l70-35v55l-70 35z" fill="#43200C"/>
        <g fill="#B26B2E" stroke-width="3">
            <ellipse cx="140" cy="160" rx="14" ry="9" transform="rotate(-20 140 160)"/>
            <ellipse cx="178" cy="154" rx="14" ry="9" transform="rotate(25 178 154)"/>
            <ellipse cx="164" cy="176" rx="13" ry="8" transform="rotate(-8 164 176)"/>
            <ellipse cx="208" cy="222" rx="13" ry="8" transform="rotate(15 208 222)"/>
        </g>
        <g stroke="#7A3F17" stroke-width="2.5"><path d="M128 160h24"/><path d="M166 154h24"/><path d="M152 176h24"/><path d="M196 222h24"/></g>
        <g fill="#FFF8EC" stroke="none" opacity=".9"><circle cx="120" cy="168" r="2.5"/><circle cx="196" cy="168" r="2.5"/><circle cx="152" cy="142" r="2"/><circle cx="110" cy="216" r="2.5"/><circle cx="236" cy="212" r="2"/><circle cx="182" cy="236" r="2"/></g>
        </g>`,

    croissant: `${SHADOW}<g ${INK}>
        <ellipse cx="160" cy="320" rx="146" ry="30" fill="#FFF8EC"/>
        <path d="M70 286q90 30 180 0" fill="none" stroke="#E07F7F" stroke-width="12"/>
        <path d="M74 280q86 26 172 0l-4 10q-82 22-164 0z" fill="#F7CF5A" stroke-width="4"/>
        <path d="M34 282C30 196 100 142 160 142s130 54 126 140c-16-18-38-24-60-18-10-30-34-44-66-44s-56 14-66 44c-22-6-44 0-60 18z" fill="#E2A04A"/>
        <g fill="none" stroke="#B8742A" stroke-width="5">
            <path d="M72 196q18 30 12 72"/><path d="M114 156q16 34 10 70"/><path d="M160 142v78"/><path d="M206 156q-16 34-10 70"/><path d="M248 196q-18 30-12 72"/>
        </g>
        <g fill="none" stroke="#F6CF85" stroke-width="7" stroke-linecap="round">
            <path d="M126 168q14-10 26-8"/><path d="M170 160q16-2 28 8"/><path d="M84 204q8-10 18-14"/><path d="M220 192q12 4 18 14"/>
        </g>
        </g>`,
};

const PRODUCTS = [
    { id: 1, art: "espresso", name: "Espresso Contexto Doble", category: "calientes", price: 7.50, tag: "Incluye QR Reto Viral", color: "#5A2A10",
      desc: "Extracción intensa de grano peruano de altura. Escanea el QR para verificar noticias y ganar 5% de descuento." },
    { id: 2, art: "cappuccino", name: "Cappuccino Artesanal", category: "calientes", price: 10.00, tag: "Favorito", color: "#C24E16",
      desc: "Espresso equilibrado con leche vaporizada sedosa y toque de cacao." },
    { id: 3, art: "latte", name: "Latte de Vainilla & Panela", category: "calientes", price: 11.50, tag: "Especial", color: "#4E6B3A",
      desc: "Suave café con leche endulzado naturalmente con panela orgánica." },
    { id: 4, art: "coldbrew", featured: true, name: "Cold Brew Naranja", category: "frios", price: 12.00, tag: "Refrescante", color: "#1D5457",
      desc: "Café macerado en frío por 16 horas con un toque cítrico de naranja." },
    { id: 5, art: "frappe", name: "Frappé Mocha Intenso", category: "frios", price: 13.50, tag: "Top Ventas", color: "#2E4766",
      desc: "Mezcla helada de espresso, chocolate bitter y crema batida." },
    { id: 6, art: "cheesecake", name: "Cheesecake de Maracuyá", category: "postres", price: 12.50, tag: "Casero", color: "#A23B5C",
      desc: "Base crocante de galleta, crema suave y jalea natural de maracuyá." },
    { id: 7, art: "brownie", name: "Brownie Tibio con Pecanas", category: "postres", price: 9.00, tag: "Ideal con café", color: "#4A1F2A",
      desc: "Chocolate al 70% con trozos de pecanas tostadas." },
    { id: 8, art: "croissant", name: "Croissant Mixto Artesanal", category: "salados", price: 11.00, tag: "Recién horneado", color: "#9A5512",
      desc: "Hojaldre de mantequilla relleno de jamón inglés y queso edam fundido." },
];

const CATEGORY_LABEL = { calientes: "Café caliente", frios: "Bebida fría", postres: "Postre", salados: "Sándwich" };

function productArt(product, cls = "") {
    if (product.photo) {
        return `<img class="${cls} product-photo" src="${product.photo}" alt="" loading="lazy">`;
    }
    // ids únicos para los clipPath cuando la misma ilustración aparece varias veces
    const uid = `${product.art}${Math.random().toString(36).slice(2, 7)}`;
    const svg = PRODUCT_ART[product.art].replace(/clip(Latte|Brew)/g, (m) => `${m}-${uid}`);
    return `<svg class="${cls}" viewBox="0 0 320 380" aria-hidden="true">${svg}</svg>`;
}
