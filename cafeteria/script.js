/* =========================================================
   Contexto — interacción, animación y chat
   ========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ---------- Ilustraciones por categoría ---------- */

const ART = {
    calientes: `
        <path class="steam-line accent" d="M24 20c-3-4 3-6 0-10"/>
        <path class="steam-line accent" d="M32 18c-3-4 3-6 0-10"/>
        <path class="steam-line accent" d="M40 20c-3-4 3-6 0-10"/>
        <path class="fill-soft" d="M14 26h34v10a14 14 0 0 1-14 14h-6A14 14 0 0 1 14 36z"/>
        <path d="M48 30h3a6 6 0 0 1 0 12h-5"/>
        <path d="M8 56h48"/>`,
    frios: `
        <path class="accent" d="M36 12l7-9"/>
        <path d="M17 12h30"/>
        <path class="fill-soft" d="M19 12h26l-3.5 42a4 4 0 0 1-4 3.6H26.5a4 4 0 0 1-4-3.6z"/>
        <rect class="accent" x="25" y="22" width="8" height="8" rx="1.5" transform="rotate(-12 29 26)"/>
        <rect class="accent" x="32" y="32" width="8" height="8" rx="1.5" transform="rotate(10 36 36)"/>
        <path d="M21 44h22"/>`,
    postres: `
        <path class="fill-soft" d="M8 40l46-14v20L8 54z"/>
        <path class="accent" d="M8 40l46-14"/>
        <path d="M8 47l46-12"/>
        <path d="M54 26c-6-6-18-4-24 4L8 40"/>
        <circle class="accent" cx="44" cy="19" r="4.5"/>
        <path d="M44 14.5c1-3 3-5 6-5.5"/>`,
    salados: `
        <path class="fill-soft" d="M6 42c3-14 14-23 26-23s23 9 26 23c-5-2-9-1-12 3-3-6-8-9-14-9s-11 3-14 9c-3-4-7-5-12-3z"/>
        <path class="accent" d="M22 22l4 13"/>
        <path class="accent" d="M32 19v16"/>
        <path class="accent" d="M42 22l-4 13"/>`,
};

function artSvg(category, cls = "product-art") {
    return `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true">${ART[category] || ART.calientes}</svg>`;
}

const ICONS = {
    plus: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
    check: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    x: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    send: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    arrow: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    coffee: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M6 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12a3.5 3.5 0 1 1 0 7h-1"/></svg>',
};

/* ---------- Productos ---------- */

const products = [
    { id: 1, name: "Espresso Contexto Doble", category: "calientes", price: 7.50, tag: "Incluye QR Reto Viral",
      desc: "Extracción intensa de grano peruano de altura. Escanea el QR para verificar noticias y ganar 5% de descuento." },
    { id: 2, name: "Cappuccino Artesanal", category: "calientes", price: 10.00, tag: "Favorito",
      desc: "Espresso equilibrado con leche vaporizada sedosa y toque de cacao." },
    { id: 3, name: "Latte de Vainilla & Panela", category: "calientes", price: 11.50, tag: "Especial",
      desc: "Suave café con leche endulzado naturalmente con panela orgánica." },
    { id: 4, name: "Cold Brew Naranja", category: "frios", price: 12.00, tag: "Refrescante",
      desc: "Café macerado en frío por 16 horas con un toque cítrico de naranja." },
    { id: 5, name: "Frappé Mocha Intenso", category: "frios", price: 13.50, tag: "Top Ventas",
      desc: "Mezcla helada de espresso, chocolate bitter y crema batida." },
    { id: 6, name: "Cheesecake de Maracuyá", category: "postres", price: 12.50, tag: "Casero",
      desc: "Base crocante de galleta, crema suave y jalea natural de maracuyá." },
    { id: 7, name: "Brownie Tibio con Pecanas", category: "postres", price: 9.00, tag: "Ideal con café",
      desc: "Chocolate al 70% con trozos de pecanas tostadas." },
    { id: 8, name: "Croissant Mixto Artesanal", category: "salados", price: 11.00, tag: "Recién horneado",
      desc: "Hojaldre de mantequilla relleno de jamón inglés y queso edam fundido." },
];

const money = (n) => `S/ ${n.toFixed(2)}`;

function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const store = {
    get(key, fallback, area = localStorage) {
        try { const v = area.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set(key, value, area = localStorage) {
        try { area.setItem(key, JSON.stringify(value)); } catch { /* almacenamiento no disponible */ }
    },
};

/* ---------- Carrito ---------- */

let cart = store.get("contexto_cart", []).filter((item) => products.some((p) => p.id === item.id));

function saveCart() { store.set("contexto_cart", cart); }

const cartBtn = document.getElementById("openCartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const deliveryZoneSelect = document.getElementById("deliveryZone");

function addToCart(productId, sourceEl) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const existing = cart.find((item) => item.id === productId);
    if (existing) existing.qty += 1;
    else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });

    saveCart();
    if (sourceEl) flyToCart(sourceEl, product).then(() => { updateCartUI(); bumpCart(); });
    else { updateCartUI(); bumpCart(); }
}

function changeQty(productId, delta) {
    const item = cart.find((i) => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((i) => i.id !== productId);
    saveCart();
    cartItemsContainer && cartItemsContainer.classList.add("no-anim");
    updateCartUI();
}

function bumpCart() {
    if (!cartBtn) return;
    cartBtn.classList.remove("bump");
    void cartBtn.offsetWidth;
    cartBtn.classList.add("bump");
}

function flyToCart(sourceEl, product) {
    if (!cartBtn || reduceMotion.matches || !sourceEl.animate) return Promise.resolve();
    const from = sourceEl.getBoundingClientRect();
    const to = cartBtn.getBoundingClientRect();
    const token = document.createElement("div");
    token.className = "fly-token";
    token.innerHTML = artSvg(product.category, "");
    document.body.appendChild(token);

    const x0 = from.left + from.width / 2 - 22;
    const y0 = from.top + from.height / 2 - 22;
    const x1 = to.left + to.width / 2 - 22;
    const y1 = to.top + to.height / 2 - 22;
    const lift = Math.min(160, Math.abs(y1 - y0) * 0.35 + 70);

    const anim = token.animate([
        { transform: `translate(${x0}px, ${y0}px) scale(0.6)`, opacity: 0 },
        { transform: `translate(${x0}px, ${y0 - 30}px) scale(1.1)`, opacity: 1, offset: 0.15 },
        { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - lift}px) scale(0.95) rotate(-20deg)`, offset: 0.55 },
        { transform: `translate(${x1}px, ${y1}px) scale(0.35) rotate(-40deg)`, opacity: 0.9 },
    ], { duration: 720, easing: "cubic-bezier(0.45, 0, 0.25, 1)" });

    return anim.finished.catch(() => {}).then(() => token.remove());
}

function updateCartUI() {
    const cartCount = document.getElementById("cartCount");
    const inlineCartSummary = document.getElementById("inlineCartSummary");

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCount) cartCount.textContent = totalItems;

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = cart.length > 0 && deliveryZoneSelect ? parseFloat(deliveryZoneSelect.value) : 0;
    const total = subtotal + shipping;

    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div class="cart-empty">${artSvg("calientes", "product-art")}<p>Aún no has agregado productos a tu pedido.</p><p><a href="carta.html">Ver la carta</a></p></div>`;
            const art = cartItemsContainer.querySelector(".product-art");
            if (art) art.style.color = "var(--coffee-dark)";
        } else {
            cartItemsContainer.innerHTML = cart.map((item, i) => `
                <div class="cart-item" style="--i:${i}">
                    <div>
                        <strong>${escapeHTML(item.name)}</strong><br>
                        <small>${money(item.price * item.qty)}</small>
                    </div>
                    <div class="qty-controls">
                        <button class="qty-btn" data-qty="-1" data-id="${item.id}" aria-label="Quitar uno de ${escapeHTML(item.name)}">−</button>
                        <span aria-live="polite">${item.qty}</span>
                        <button class="qty-btn" data-qty="1" data-id="${item.id}" aria-label="Agregar uno de ${escapeHTML(item.name)}">+</button>
                    </div>
                </div>`).join("");
        }
    }

    if (inlineCartSummary) {
        if (cart.length === 0) {
            inlineCartSummary.innerHTML = `<p>Tu carrito está vacío. Ve a <strong>Nuestra Carta</strong> para agregar productos.</p>`;
        } else {
            inlineCartSummary.innerHTML = `
                ${cart.map((i) => `<div>• ${i.qty}x ${escapeHTML(i.name)} — <strong>${money(i.price * i.qty)}</strong></div>`).join("")}
                <hr>
                <div>Envío: <strong>${money(shipping)}</strong></div>
                <div class="summary-total">Total a pagar: <strong>${money(total)}</strong></div>`;
        }
    }

    const drawerSubtotal = document.getElementById("drawerSubtotal");
    const drawerTotal = document.getElementById("drawerTotal");
    if (drawerSubtotal) drawerSubtotal.textContent = money(subtotal);
    if (drawerTotal) drawerTotal.textContent = money(subtotal);
}

let lastFocus = null;

function openCart() {
    if (!cartDrawer) return;
    lastFocus = document.activeElement;
    cartItemsContainer && cartItemsContainer.classList.remove("no-anim");
    cartDrawer.classList.add("open");
    document.body.classList.add("overlay-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    cartOverlay && cartOverlay.classList.add("open");
    cartBtn && cartBtn.setAttribute("aria-expanded", "true");
    setTimeout(() => document.getElementById("closeCartBtn")?.focus({ preventScroll: true }), 60);
}

function closeCart() {
    if (!cartDrawer || !cartDrawer.classList.contains("open")) return;
    cartDrawer.classList.remove("open");
    document.body.classList.remove("overlay-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    cartOverlay && cartOverlay.classList.remove("open");
    cartBtn && cartBtn.setAttribute("aria-expanded", "false");
    lastFocus && lastFocus.focus({ preventScroll: true });
}

cartBtn && cartBtn.addEventListener("click", openCart);
document.getElementById("closeCartBtn")?.addEventListener("click", closeCart);
cartOverlay && cartOverlay.addEventListener("click", closeCart);
cartItemsContainer && cartItemsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-qty]");
    if (btn) changeQty(Number(btn.dataset.id), Number(btn.dataset.qty));
});

/* ---------- Carta ---------- */

const menuGrid = document.getElementById("menuGrid");
const filterBtns = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");
const filterIndicator = document.querySelector(".filter-indicator");

function renderMenu(category = "todos", searchTerm = "") {
    if (!menuGrid) return;
    const term = searchTerm.trim().toLowerCase();
    const filtered = products.filter((item) => {
        const matchesCat = category === "todos" || item.category === category;
        const matchesSearch = item.name.toLowerCase().includes(term) || item.desc.toLowerCase().includes(term);
        return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
        menuGrid.innerHTML = `<div class="menu-empty"><strong>No encontramos “${escapeHTML(searchTerm)}”</strong>Prueba con otra palabra o elige “Todos”.</div>`;
        return;
    }

    menuGrid.innerHTML = filtered.map((product, i) => `
        <article class="product-card enter" style="--i:${Math.min(i, 7)}">
            <div class="product-banner">
                <span class="product-tag">${escapeHTML(product.tag)}</span>
                ${artSvg(product.category)}
            </div>
            <div class="product-body">
                <div>
                    <h3>${escapeHTML(product.name)}</h3>
                    <p>${escapeHTML(product.desc)}</p>
                </div>
                <div class="product-footer">
                    <span class="price">${money(product.price)}</span>
                    <button class="add-btn" data-add="${product.id}" aria-label="Agregar ${escapeHTML(product.name)} al pedido">${ICONS.plus} Agregar</button>
                </div>
            </div>
        </article>`).join("");
}

function moveIndicator(btn, instant = false) {
    if (!filterIndicator || !btn) return;
    if (instant) filterIndicator.style.transition = "none";
    filterIndicator.style.width = `${btn.offsetWidth}px`;
    filterIndicator.style.height = `${btn.offsetHeight}px`;
    filterIndicator.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
    if (instant) requestAnimationFrame(() => (filterIndicator.style.transition = ""));
}

const activeCategory = () => document.querySelector(".filter-btn.active")?.dataset.category || "todos";

filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterBtns.forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        moveIndicator(btn);
        renderMenu(btn.dataset.category, searchInput ? searchInput.value : "");
    });
});

if (filterBtns.length) {
    moveIndicator(document.querySelector(".filter-btn.active"), true);
    window.addEventListener("resize", () => moveIndicator(document.querySelector(".filter-btn.active"), true));
    document.fonts && document.fonts.ready.then(() => moveIndicator(document.querySelector(".filter-btn.active"), true));
}

let searchTimer;
searchInput && searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => renderMenu(activeCategory(), searchInput.value), 140);
});

menuGrid && menuGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = Number(btn.dataset.add);
    addToCart(id, btn);
    btn.classList.add("added");
    btn.innerHTML = `${ICONS.check} Agregado`;
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.classList.remove("added"); btn.innerHTML = `${ICONS.plus} Agregar`; }, 1400);
});

/* ---------- Delivery ---------- */

deliveryZoneSelect && deliveryZoneSelect.addEventListener("change", updateCartUI);

const deliveryForm = document.getElementById("deliveryForm");
const orderModal = document.getElementById("orderModal");
const formError = document.getElementById("formError");

function showFormError(msg) {
    if (!formError) return;
    formError.hidden = true;
    void formError.offsetWidth;
    formError.textContent = msg;
    formError.hidden = false;
}

deliveryForm && deliveryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (cart.length === 0) {
        showFormError("Tu carrito está vacío. Abre “Nuestra Carta” y agrega productos primero.");
        return;
    }
    const invalid = [...deliveryForm.querySelectorAll("[required]")].find((el) => !el.value.trim());
    if (invalid) {
        const label = deliveryForm.querySelector(`label[for="${invalid.id}"]`)?.textContent || "este campo";
        showFormError(`Falta completar: ${label}.`);
        invalid.focus();
        return;
    }
    formError && (formError.hidden = true);

    const val = (id) => escapeHTML(document.getElementById(id).value.trim());
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = parseFloat(deliveryZoneSelect.value);
    const total = subtotal + shipping;

    document.getElementById("receiptDetails").innerHTML = `
        <p><strong>Cliente:</strong> ${val("customerName")}</p>
        <p><strong>Teléfono:</strong> ${val("customerPhone")}</p>
        <p><strong>Lugar de entrega:</strong> ${val("customerAddress")}</p>
        <p><strong>Pago:</strong> ${val("paymentMethod")}</p>
        <hr>
        ${cart.map((i) => `<p>${i.qty}x ${escapeHTML(i.name)} (${money(i.price * i.qty)})</p>`).join("")}
        <p>Envío: ${money(shipping)}</p>
        <p style="margin-top: 8px;"><strong>Total final: ${money(total)}</strong></p>`;

    lastFocus = document.activeElement;
    orderModal.classList.add("open");
    document.body.classList.add("overlay-open");
    setTimeout(() => document.getElementById("closeModalBtn")?.focus({ preventScroll: true }), 50);
});

function closeOrderModal() {
    if (!orderModal || !orderModal.classList.contains("open")) return;
    orderModal.classList.remove("open");
    document.body.classList.remove("overlay-open");
    cart = [];
    saveCart();
    deliveryForm.reset();
    updateCartUI();
    lastFocus && lastFocus.focus({ preventScroll: true });
}

document.getElementById("closeModalBtn")?.addEventListener("click", closeOrderModal);

/* ---------- Navegación y entradas ---------- */

const navbar = document.getElementById("navbar");
if (navbar) {
    const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
}

// Divide el título en letras para la entrada
document.querySelectorAll("[data-split]").forEach((el) => {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.innerHTML = [...text].map((ch, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${escapeHTML(ch)}</span>`).join("");
});

// Revela secciones (una sola vez) al entrar en pantalla
const revealEls = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) { entry.target.classList.add("in-view"); io.unobserve(entry.target); }
        });
    }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
} else {
    revealEls.forEach((el) => el.classList.add("in-view"));
}

// Pausa los bucles decorativos cuando no se ven
function pauseWhenHidden(el) {
    if (!el || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(([entry]) => el.classList.toggle("paused", !entry.isIntersecting)).observe(el);
}
document.querySelectorAll(".hero-visual, .ticker, .scooter-lane").forEach(pauseWhenHidden);

// Inclinación suave del logo hacia el puntero
const logoCard = document.getElementById("logoCard");
if (logoCard && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion.matches) {
    logoCard.addEventListener("pointermove", (e) => {
        const r = logoCard.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        logoCard.style.setProperty("--tilt-y", `${px * 8}deg`);
        logoCard.style.setProperty("--tilt-x", `${py * -8}deg`);
    });
    logoCard.addEventListener("pointerleave", () => {
        logoCard.style.setProperty("--tilt-y", "0deg");
        logoCard.style.setProperty("--tilt-x", "0deg");
    });
}

/* ---------- Manifiesto: palabra por palabra al hacer scroll ---------- */

function initWordReveal(passage) {
    const section = passage.closest(".manifesto");
    if (!section) return;

    // Copia intacta para lectores de pantalla; la versión dividida queda solo visual
    const accessible = passage.cloneNode(true);
    accessible.removeAttribute("data-word-reveal");
    accessible.classList.add("sr-only");
    passage.removeAttribute("id");
    passage.setAttribute("aria-hidden", "true");
    passage.before(accessible);

    const walker = document.createTreeWalker(passage, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => (node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        node.nodeValue.split(/(\s+)/).forEach((token) => {
            if (/^\s+$/.test(token)) fragment.append(token);
            else if (token) {
                const span = document.createElement("span");
                span.dataset.word = "";
                span.textContent = token;
                fragment.append(span);
            }
        });
        node.replaceWith(fragment);
    });

    const words = [...passage.querySelectorAll("[data-word]")];
    const percentEl = section.querySelector(".read-percent");
    let scheduled = false;

    function render() {
        scheduled = false;
        const rect = section.getBoundingClientRect();
        const distance = Math.max(1, section.offsetHeight - window.innerHeight);
        const progress = reduceMotion.matches ? 1 : Math.min(1, Math.max(0, -rect.top / distance));
        section.style.setProperty("--progress", progress.toFixed(4));
        // la "cabeza" de lectura avanza con el scroll; cada palabra se funde en ~2.4 palabras de recorrido
        const head = 2.4 + progress * (words.length + 0.4);
        words.forEach((word, i) => {
            const local = Math.min(1, Math.max(0, (head - i) / 2.4));
            word.style.setProperty("--word-progress", local.toFixed(3));
        });
        if (percentEl) percentEl.textContent = `${Math.round(progress * 100)}%`;
    }

    const request = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(render); } };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    reduceMotion.addEventListener?.("change", request);
    document.fonts && document.fonts.ready.then(request);
    render();
}

document.querySelectorAll("[data-word-reveal]").forEach(initWordReveal);

/* ---------- Reto del día ---------- */

// Edita, agrega o cambia estos retos cuando quieras.
const RETOS = [
    {
        claim: "Una noticia con miles de “me gusta” y compartidos es más confiable.",
        answer: false,
        explain: "La popularidad no prueba nada. Revisa quién la publica, la fecha y si otros medios serios la confirman.",
    },
    {
        claim: "El grano de café es la semilla de un fruto rojo llamado cereza de café.",
        answer: true,
        explain: "Así es: cada cereza guarda normalmente dos semillas, que luego se secan y se tuestan.",
    },
    {
        claim: "Si un titular te indigna mucho, conviene compartirlo rápido para avisar a todos.",
        answer: false,
        explain: "Los titulares que provocan emociones fuertes son el formato favorito de la desinformación. Pausa, lee completo y verifica antes de compartir.",
    },
];

const retoCard = document.getElementById("retoCard");
if (retoCard) {
    let idx = 0;
    let score = 0;
    const claimEl = document.getElementById("retoClaim");
    const countEl = document.getElementById("retoCount");
    const progressEl = document.getElementById("retoProgress");
    const resultEl = document.getElementById("retoResult");
    const verdictEl = document.getElementById("retoVerdict");
    const explainEl = document.getElementById("retoExplain");
    const stampEl = document.getElementById("retoStamp");
    const nextBtn = document.getElementById("retoNext");
    const answerBtns = retoCard.querySelectorAll("[data-answer]");

    progressEl.innerHTML = RETOS.map(() => "<span></span>").join("");

    function showReto(animate) {
        const reto = RETOS[idx];
        claimEl.textContent = `“${reto.claim}”`;
        countEl.textContent = `Reto ${idx + 1} de ${RETOS.length}`;
        [...progressEl.children].forEach((s, i) => { s.className = i < idx ? "done" : i === idx ? "current" : ""; });
        resultEl.hidden = true;
        stampEl.className = "stamp";
        answerBtns.forEach((b) => { b.disabled = false; b.classList.remove("chosen"); });
        if (animate) { claimEl.classList.remove("swap"); void claimEl.offsetWidth; claimEl.classList.add("swap"); }
    }

    answerBtns.forEach((btn) => btn.addEventListener("click", () => {
        const reto = RETOS[idx];
        const guess = btn.dataset.answer === "true";
        const correct = guess === reto.answer;
        if (correct) score += 1;
        answerBtns.forEach((b) => { b.disabled = true; b.classList.toggle("chosen", b === btn); });

        stampEl.textContent = reto.answer ? "Verdadero" : "Falso";
        stampEl.className = `stamp ${reto.answer ? "is-true" : "is-false"}`;
        void stampEl.offsetWidth;
        stampEl.classList.add("show");
        retoCard.classList.remove("thud"); void retoCard.offsetWidth; retoCard.classList.add("thud");

        verdictEl.textContent = correct ? "¡Buen criterio! Acertaste." : "Esta vez no. Así se verifica:";
        explainEl.textContent = reto.explain;
        const last = idx === RETOS.length - 1;
        nextBtn.innerHTML = last ? `Volver a empezar ${ICONS.arrow}` : `Siguiente reto ${ICONS.arrow}`;
        nextBtn.querySelector(".icon").classList.add("arrow");
        if (last) verdictEl.textContent += ` Resultado: ${score} de ${RETOS.length}.`;
        resultEl.hidden = false;
        nextBtn.focus({ preventScroll: true });
    }));

    nextBtn.addEventListener("click", () => {
        if (idx === RETOS.length - 1) { idx = 0; score = 0; } else idx += 1;
        showReto(true);
        answerBtns[0].focus({ preventScroll: true });
    });

    showReto(false);
}

/* =========================================================
   Chat en vivo
   ---------------------------------------------------------
   Para conectar tu servicio real (Firebase, Socket.io, etc.):

     ContextoChat.onSend = (texto) => { ...envía "texto" a tu servidor... };
     // y cuando llegue una respuesta de tu equipo:
     ContextoChat.receive("¡Hola! Tu pedido sale en 5 minutos.");

   Mientras onSend no esté definido, el asistente responde solo
   las preguntas frecuentes con la información de esta web.
   ========================================================= */

const WHATSAPP = "51987654321";

const FAQ = [
    { test: /horario|hora|abren|abierto|cierran|atienden/i,
      reply: "Atendemos de lunes a sábado, de 8:00 a. m. a 9:30 p. m., en el campus universitario." },
    { test: /delivery|env[ií]o|zona|llevan|reparto|costo de env/i,
      reply: "Hacemos delivery: Campus / El Tambo S/ 4.00 · San Carlos / La Merced S/ 5.00 · Chilca / Pilcomayo S/ 7.00. El recojo en barra es gratis.",
      link: { href: "delivery.html", text: "Hacer mi pedido" } },
    { test: /pago|pagar|yape|plin|tarjeta|efectivo/i,
      reply: "Aceptamos Yape, Plin, efectivo contra entrega y tarjeta con POS inalámbrico." },
    { test: /qr|reto|descuento|promo/i,
      reply: "Cada producto trae un QR con un reto de verificación de noticias. Si lo superas, ganas entre 5% y 10% de descuento." },
    { test: /carta|men[uú]|precio|cu[aá]nto|caf[eé]|postre|s[aá]ndwich/i,
      reply: "Tenemos cafés calientes, bebidas frías, postres y sándwiches, desde S/ 7.50.",
      link: { href: "carta.html", text: "Ver la carta" } },
    { test: /^(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|hey)\b/i,
      reply: "¡Hola! ¿En qué te ayudo? Puedo contarte del horario, la carta, el delivery o los retos QR." },
];

const CHIPS = ["Horario", "Zonas de delivery", "¿Cómo funcionan los retos QR?", "Métodos de pago"];

function isOpenNow() {
    try {
        const parts = new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", weekday: "short", hour: "numeric", minute: "numeric", hour12: false })
            .formatToParts(new Date());
        const get = (t) => parts.find((p) => p.type === t)?.value || "";
        const day = get("weekday").toLowerCase();
        const mins = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);
        return !day.startsWith("dom") && mins >= 8 * 60 && mins < 21 * 60 + 30;
    } catch { return false; }
}

const ContextoChat = (() => {
    const api = { onSend: null, receive: (text) => addMessage("bot", text) };
    let history = store.get("contexto_chat", [], sessionStorage);

    const launcher = document.createElement("button");
    launcher.className = "chat-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Abrir chat con Contexto");
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "chatPanel");
    launcher.innerHTML = `
        <svg viewBox="0 0 68 60" aria-hidden="true">
            <path class="bubble-shape" d="M34 3C17 3 4 13 4 26c0 8 5 15 13 19l-4 11 14-8c2 .3 4.5.5 7 .5 17 0 30-10 30-22.5S51 3 34 3z"/>
            <circle class="ldot" cx="22" cy="26" r="4.2"/>
            <circle class="ldot" cx="34" cy="26" r="4.2"/>
            <circle class="ldot" cx="46" cy="26" r="4.2"/>
            <g class="x-mark" stroke="#5C2809" stroke-width="4" stroke-linecap="round"><path d="M27 19l14 14M41 19 27 33"/></g>
        </svg>
        <span class="unread"></span>`;

    const open = isOpenNow();
    const panel = document.createElement("section");
    panel.className = "chat-panel";
    panel.id = "chatPanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chat con Contexto");
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = `
        <header class="chat-head">
            <span class="chat-avatar">${ICONS.coffee}</span>
            <div>
                <h2>Contexto en vivo</h2>
                <p class="chat-status ${open ? "is-open" : ""}">${open ? "Barra abierta ahora" : "Fuera de horario · abrimos a las 8:00 a. m."}</p>
            </div>
            <button type="button" class="chat-close" aria-label="Cerrar chat">${ICONS.x}</button>
        </header>
        <div class="chat-log" role="log" aria-live="polite"></div>
        <div class="chat-chips">${CHIPS.map((c) => `<button type="button" class="chip">${c}</button>`).join("")}</div>
        <form class="chat-form">
            <input type="text" placeholder="Escribe tu mensaje…" aria-label="Mensaje" maxlength="500" autocomplete="off">
            <button type="submit" class="chat-send" aria-label="Enviar" disabled>${ICONS.send}</button>
        </form>`;

    const nudge = document.createElement("div");
    nudge.className = "chat-nudge";
    nudge.hidden = true;
    nudge.innerHTML = `¿Dudas con tu pedido? Escríbenos aquí. <button type="button" aria-label="Cerrar aviso">${ICONS.x}</button>`;

    document.body.append(nudge, panel, launcher);

    const log = panel.querySelector(".chat-log");
    const form = panel.querySelector(".chat-form");
    const input = form.querySelector("input");
    const sendBtn = form.querySelector(".chat-send");

    function renderMessage(msg, restored) {
        const el = document.createElement("div");
        el.className = `msg msg-${msg.from}${restored ? " restored" : ""}`;
        const p = document.createElement("div");
        p.textContent = msg.text;
        el.appendChild(p);
        if (msg.link) {
            const a = document.createElement("a");
            a.href = msg.link.href;
            a.textContent = msg.link.text;
            if (/^https?:/.test(msg.link.href)) { a.target = "_blank"; a.rel = "noopener"; }
            a.insertAdjacentHTML("beforeend", ICONS.arrow);
            el.appendChild(a);
        }
        log.appendChild(el);
        log.scrollTop = log.scrollHeight;
    }

    function addMessage(from, text, link) {
        const msg = { from, text: String(text), link };
        history.push(msg);
        history = history.slice(-40);
        store.set("contexto_chat", history, sessionStorage);
        renderMessage(msg, false);
        if (from === "bot" && !panel.classList.contains("open")) launcher.classList.add("has-unread");
    }

    function showTyping() {
        const t = document.createElement("div");
        t.className = "msg msg-bot msg-typing";
        t.setAttribute("aria-label", "Escribiendo");
        t.innerHTML = "<i></i><i></i><i></i>";
        log.appendChild(t);
        log.scrollTop = log.scrollHeight;
        return t;
    }

    function localReply(text) {
        const hit = FAQ.find((f) => f.test.test(text));
        const typing = showTyping();
        setTimeout(() => {
            typing.remove();
            if (hit) addMessage("bot", hit.reply, hit.link);
            else addMessage("bot", "Te leo. El chat con nuestro equipo todavía se está conectando; si es urgente, escríbenos por WhatsApp.",
                { href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, text: "Seguir por WhatsApp" });
        }, reduceMotion.matches ? 150 : 650);
    }

    function send(text) {
        text = text.trim();
        if (!text) return;
        addMessage("user", text);
        if (typeof api.onSend === "function") {
            try { api.onSend(text); } catch (err) { console.error(err); }
        } else {
            localReply(text);
        }
    }

    function openPanel() {
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        launcher.setAttribute("aria-expanded", "true");
        launcher.setAttribute("aria-label", "Cerrar chat");
        launcher.classList.remove("has-unread");
        nudge.hidden = true;
        store.set("contexto_nudged", true, sessionStorage);
        log.scrollTop = log.scrollHeight;
        setTimeout(() => input.focus({ preventScroll: true }), 80);
    }

    function closePanel(returnFocus = true) {
        if (!panel.classList.contains("open")) return;
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
        launcher.setAttribute("aria-expanded", "false");
        launcher.setAttribute("aria-label", "Abrir chat con Contexto");
        if (returnFocus) launcher.focus({ preventScroll: true });
    }

    launcher.addEventListener("click", () => (panel.classList.contains("open") ? closePanel() : openPanel()));
    panel.querySelector(".chat-close").addEventListener("click", () => closePanel());
    nudge.querySelector("button").addEventListener("click", () => { nudge.hidden = true; store.set("contexto_nudged", true, sessionStorage); });
    nudge.addEventListener("click", (e) => { if (e.target === nudge) openPanel(); });

    input.addEventListener("input", () => (sendBtn.disabled = !input.value.trim()));
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        send(input.value);
        input.value = "";
        sendBtn.disabled = true;
        sendBtn.classList.remove("sent"); void sendBtn.offsetWidth; sendBtn.classList.add("sent");
    });
    panel.querySelector(".chat-chips").addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (chip) send(chip.textContent);
    });

    // Historial de la sesión (se conserva al cambiar de página)
    if (history.length) history.forEach((m) => renderMessage(m, true));
    else addMessage("bot", "¡Hola! Soy el asistente de Contexto. Pregúntame por la carta, el delivery o los retos QR.");
    launcher.classList.remove("has-unread");

    // Aviso amable, una vez por sesión
    if (!store.get("contexto_nudged", false, sessionStorage)) {
        setTimeout(() => { if (!panel.classList.contains("open")) nudge.hidden = false; }, 7000);
    }

    api.open = openPanel;
    api.close = closePanel;
    return api;
})();

window.ContextoChat = ContextoChat;

/* ---------- Teclado: Escape cierra lo que esté abierto ---------- */

document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (orderModal && orderModal.classList.contains("open")) closeOrderModal();
    else if (document.getElementById("chatPanel")?.classList.contains("open")) ContextoChat.close();
    else closeCart();
});

renderMenu();
updateCartUI();
