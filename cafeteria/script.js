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

const products = PRODUCTS;

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
            <div class="product-banner" style="--banner:${product.color}">
                <span class="product-tag">${escapeHTML(product.tag)}</span>
                ${productArt(product, "product-illus")}
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

    const raw = (id) => document.getElementById(id).value.trim();
    const val = (id) => escapeHTML(raw(id));
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = parseFloat(deliveryZoneSelect.value);
    const total = subtotal + shipping;
    const zone = deliveryZoneSelect.options[deliveryZoneSelect.selectedIndex].text;

    document.getElementById("receiptDetails").innerHTML = `
        <p><strong>Cliente:</strong> ${val("customerName")}</p>
        <p><strong>Teléfono:</strong> ${val("customerPhone")}</p>
        <p><strong>Lugar de entrega:</strong> ${val("customerAddress")}</p>
        <p><strong>Pago:</strong> ${val("paymentMethod")}</p>
        <hr>
        ${cart.map((i) => `<p>${i.qty}x ${escapeHTML(i.name)} (${money(i.price * i.qty)})</p>`).join("")}
        <p>Envío: ${money(shipping)}</p>
        <p style="margin-top: 8px;"><strong>Total: ${money(total)}</strong></p>`;

    const message = [
        "¡Hola, Contexto! Quiero hacer este pedido:",
        "",
        ...cart.map((i) => `• ${i.qty}x ${i.name} — ${money(i.price * i.qty)}`),
        "",
        `Entrega: ${zone}`,
        `Total: ${money(total)}`,
        "",
        `Nombre: ${raw("customerName")}`,
        `Teléfono: ${raw("customerPhone")}`,
        `Dirección: ${raw("customerAddress")}`,
        `Pago: ${raw("paymentMethod")}`,
    ].join("\n");
    document.getElementById("sendWhatsApp").href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;

    lastFocus = document.activeElement;
    orderModal.classList.add("open");
    document.body.classList.add("overlay-open");
    setTimeout(() => document.getElementById("sendWhatsApp")?.focus({ preventScroll: true }), 50);
});

function closeOrderModal() {
    if (!orderModal || !orderModal.classList.contains("open")) return;
    orderModal.classList.remove("open");
    document.body.classList.remove("overlay-open");
    lastFocus && lastFocus.focus({ preventScroll: true });
}

// Al enviar por WhatsApp se vacía el carrito y se muestra qué sigue
document.getElementById("sendWhatsApp")?.addEventListener("click", () => {
    setTimeout(() => {
        cart = [];
        saveCart();
        deliveryForm.reset();
        updateCartUI();
        closeOrderModal();
        const summary = document.getElementById("inlineCartSummary");
        if (summary) summary.innerHTML = `<p><strong>¡Pedido enviado a WhatsApp!</strong> Te confirmaremos por ahí. Si no se abrió WhatsApp, escríbenos al ${escapeHTML(SITE.phoneDisplay)}.</p>`;
    }, 300);
});

document.getElementById("closeModalBtn")?.addEventListener("click", closeOrderModal);


/* ---------- Datos del negocio (config.js) ---------- */

(function applySiteData() {
    const wa = `https://wa.me/${SITE.whatsapp}`;
    document.querySelectorAll("[data-site]").forEach((el) => {
        const v = SITE[el.dataset.site];
        if (v) el.textContent = v; else if (el.dataset.site === "addressDetail") el.hidden = true;
    });
    document.querySelectorAll("[data-whatsapp-link]").forEach((a) => (a.href = wa));
    document.querySelectorAll("[data-instagram-link]").forEach((a) => {
        if (!SITE.instagram) return;
        a.href = `https://instagram.com/${SITE.instagram}`;
        if (!a.textContent.trim()) a.textContent = `@${SITE.instagram}`;
        a.hidden = false;
    });
    document.querySelectorAll("[data-instagram-wrap]").forEach((el) => (el.hidden = !SITE.instagram));

    const hours = document.getElementById("visitHours");
    if (hours) hours.innerHTML = SITE.hours.map((h) => `<li><span>${escapeHTML(h.days)}</span><strong>${escapeHTML(h.time)}</strong></li>`).join("");

    const mapsLink = document.getElementById("mapsLink");
    const media = document.getElementById("visitMedia");
    if (SITE.mapsQuery) {
        if (mapsLink) { mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapsQuery)}`; mapsLink.hidden = false; }
        if (media) {
            media.classList.add("has-map");
            media.innerHTML = `<iframe title="Mapa: ubicación de Contexto" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&output=embed"></iframe>`;
        }
    }
})();

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

/* ---------- Vitrina: carrusel de productos ---------- */

const showcase = document.getElementById("showcasePanel");
if (showcase) {
    const stage = document.getElementById("showcaseStage");
    const thumbs = document.getElementById("showcaseThumbs");
    const info = document.getElementById("showcaseInfo");
    const addBtn = document.getElementById("slideAdd");
    const pauseBtn = document.getElementById("slidePause");
    const countEl = document.getElementById("slideCount");
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const AUTOPLAY_MS = 6000;
    const n = products.length;
    let current = 0;
    let timer = null;
    let userPaused = reduceMotion.matches;
    let hovering = false;
    let visible = true;

    stage.innerHTML = products.map((p, i) => `
        <button type="button" class="slide" data-index="${i}" tabindex="-1" aria-label="Ver ${escapeHTML(p.name)}">
            ${productArt(p, "slide-art")}
        </button>`).join("");
    thumbs.innerHTML = products.map((p, i) => `
        <button type="button" class="thumb" role="tab" data-index="${i}" aria-label="${escapeHTML(p.name)}" aria-selected="false">
            ${productArt(p, "")}
        </button>`).join("");

    const slides = [...stage.querySelectorAll(".slide")];
    const thumbBtns = [...thumbs.querySelectorAll(".thumb")];
    const pad = (x) => String(x).padStart(2, "0");

    function slotOf(i) {
        const d = (i - current + n) % n;
        if (d === 0) return "0";
        if (d === 1) return "1";
        if (d === 2) return "2";
        if (d === n - 1) return "-1";
        return "hidden";
    }

    function show(index, { animateInfo = true } = {}) {
        current = (index + n) % n;
        const p = products[current];
        slides.forEach((el, i) => {
            const slot = slotOf(i);
            el.dataset.slot = slot;
            el.tabIndex = slot === "1" || slot === "2" ? 0 : -1;
            el.setAttribute("aria-hidden", slot === "1" || slot === "2" ? "false" : "true");
        });
        thumbBtns.forEach((t, i) => t.setAttribute("aria-selected", String(i === current)));
        showcase.style.setProperty("--slide-bg", p.color);
        if (themeMeta) themeMeta.setAttribute("content", p.color);

        document.getElementById("slideCat").textContent = CATEGORY_LABEL[p.category] || "";
        document.getElementById("slideName").textContent = p.name;
        document.getElementById("slideDesc").textContent = p.desc;
        document.getElementById("slidePrice").textContent = money(p.price);
        countEl.textContent = `${pad(current + 1)} / ${pad(n)}`;
        addBtn.dataset.id = p.id;
        addBtn.classList.remove("added");
        addBtn.textContent = "+ Agregar al pedido";

        if (animateInfo) { info.classList.remove("swap"); void info.offsetWidth; info.classList.add("swap"); }
        schedule();
    }

    function schedule() {
        clearTimeout(timer);
        if (userPaused || hovering || !visible || document.hidden) return;
        timer = setTimeout(() => show(current + 1), AUTOPLAY_MS);
    }

    function setPaused(paused) {
        userPaused = paused;
        pauseBtn.setAttribute("aria-pressed", String(paused));
        pauseBtn.setAttribute("aria-label", paused ? "Reanudar carrusel" : "Pausar carrusel");
        schedule();
    }

    document.getElementById("slidePrev").addEventListener("click", () => show(current - 1));
    document.getElementById("slideNext").addEventListener("click", () => show(current + 1));
    pauseBtn.addEventListener("click", () => setPaused(!userPaused));
    stage.addEventListener("click", (e) => {
        const s = e.target.closest(".slide");
        if (s && s.dataset.slot !== "0") show(Number(s.dataset.index));
    });
    thumbs.addEventListener("click", (e) => {
        const t = e.target.closest(".thumb");
        if (t) show(Number(t.dataset.index));
    });
    addBtn.addEventListener("click", () => {
        const id = Number(addBtn.dataset.id);
        const slideEl = slides[current];
        addToCart(id, slideEl);
        addBtn.classList.add("added");
        addBtn.textContent = "✓ Agregado";
        clearTimeout(addBtn._t);
        addBtn._t = setTimeout(() => { addBtn.classList.remove("added"); addBtn.textContent = "+ Agregar al pedido"; }, 1600);
    });

    // teclado: flechas dentro de la vitrina
    showcase.addEventListener("keydown", (e) => {
        if (e.target.matches("input, textarea")) return;
        if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
    });

    // deslizar con el dedo
    let startX = null;
    stage.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    stage.addEventListener("pointerup", (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 45) show(current + (dx < 0 ? 1 : -1));
    });

    // pausa al pasar el mouse, al enfocar, fuera de pantalla o en otra pestaña
    showcase.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hovering = true; schedule(); } });
    showcase.addEventListener("pointerleave", () => { hovering = false; schedule(); });
    showcase.addEventListener("focusin", () => { hovering = true; schedule(); });
    showcase.addEventListener("focusout", () => { hovering = false; schedule(); });
    document.addEventListener("visibilitychange", schedule);
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            showcase.classList.toggle("paused", !visible);
            schedule();
        }, { threshold: 0.3 }).observe(showcase);
    }

    if (userPaused) setPaused(true);
    // empieza en el producto marcado con featured: true en products.js
    show(Math.max(0, products.findIndex((p) => p.featured)), { animateInfo: false });
}

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

const WHATSAPP = SITE.whatsapp;

const FAQ = [
    { test: /horario|hora|abren|abierto|cierran|atienden/i,
      reply: `Atendemos ${SITE.hours.map((h) => `${h.days.toLowerCase()}: ${h.time}`).join(" · ")}.` },
    { test: /d[oó]nde|ubicaci[oó]n|direcci[oó]n|llegar|queda|local/i,
      reply: `Estamos en ${[SITE.address, SITE.addressDetail].filter(Boolean).join(", ")}.`,
      link: SITE.mapsQuery ? { href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapsQuery)}`, text: "Abrir en Google Maps" } : undefined },
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

const CHIPS = ["Horario", "¿Dónde están?", "Zonas de delivery", "¿Cómo funcionan los retos QR?", "Métodos de pago"];

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

/* ---------- Experiencia 3D: navegación por estaciones ---------- */

document.addEventListener("station", (e) => {
    const id = e.detail;
    document.querySelectorAll("[data-station-link]").forEach((a) => {
        const on = a.dataset.stationLink === id;
        a.classList.toggle("on", on);
        if (a.classList.contains("nav-pill")) {
            a.classList.toggle("active-pill", on);
            if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
        }
    });
});
document.getElementById("drawerToDelivery")?.addEventListener("click", () => closeCart());

renderMenu();
updateCartUI();
