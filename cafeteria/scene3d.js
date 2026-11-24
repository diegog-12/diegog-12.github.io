/* =========================================================
   Contexto — el mundo 3D
   Una cafetería en miniatura sobre una isla flotante.
   El scroll mueve la cámara de estación en estación.
   ========================================================= */

import * as THREE from "three";

const canvas = document.getElementById("world");
const loaderEl = document.getElementById("worldLoader");
const tipEl = document.getElementById("tip3d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileQuery = window.matchMedia("(max-width: 860px)");

const C = {
    cream: 0xFBF1E3, light: 0xFFFAF3, white: 0xFFF8EC, ink: 0x24160F,
    orange: 0xE87A14, yellow: 0xF7B13C, teal: 0x1D5457, tealDeep: 0x133A3D, mint: 0x9CC9C2,
    coffee: 0x5A2A10, crema: 0xA85A24, mocha: 0x8B5A3C, foam: 0xF2DCB8, milk: 0xD9A86C,
    brownie: 0x5A2C12, brownieTop: 0x7A4425, pecan: 0xB26B2E, cheese: 0xFFF1D6, crust: 0xB5763A,
    passion: 0xF2B705, croissant: 0xE2A04A, leaf: 0x5C8F3E, raspberry: 0xA23B5C, navy: 0x2E4766,
};

function finish() {
    document.documentElement.classList.add("world-ready");
    loaderEl?.classList.add("hide");
}

function webglAvailable() {
    try {
        const c = document.createElement("canvas");
        return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch { return false; }
}

if (!canvas || !webglAvailable()) {
    document.documentElement.classList.add("no-webgl");
    finish();
} else {
    start().catch((err) => {
        console.error(err);
        document.documentElement.classList.add("no-webgl");
        finish();
    });
}

/* ---------- utilidades ---------- */

const matCache = new Map();
function mat(color, opts = {}) {
    const key = color + JSON.stringify(opts);
    if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0, ...opts }));
    return matCache.get(key);
}

function mesh(geo, material, o = {}) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(o.x || 0, o.y || 0, o.z || 0);
    m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
    if (o.s) Array.isArray(o.s) ? m.scale.set(...o.s) : m.scale.setScalar(o.s);
    m.castShadow = o.cast !== false;
    m.receiveShadow = !!o.receive;
    return m;
}

function canvasTexture(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

const css = (hex) => `#${hex.toString(16).padStart(6, "0")}`;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

/* ---------- piezas reutilizables ---------- */

function makeCup({ h = 2.6, rTop = 2, rBot = 1.45, body = C.white, coffee = C.crema, band = C.orange, text = null, textColor = "#24160F", saucer = true, handle = true } = {}) {
    const g = new THREE.Group();
    const cup = new THREE.Group();
    const saucerH = saucer ? h * 0.07 : 0;
    cup.position.y = saucerH;
    g.add(cup);
    const rAt = (y) => rBot + (rTop - rBot) * (y / h);

    cup.add(mesh(new THREE.CylinderGeometry(rTop, rBot, h, 48, 1, true), mat(body, { side: THREE.DoubleSide }), { y: h / 2 }));
    cup.add(mesh(new THREE.CircleGeometry(rBot, 40), mat(body), { y: 0.01, rx: -Math.PI / 2 }));
    cup.add(mesh(new THREE.TorusGeometry(rTop, Math.max(0.035, 0.035 * rTop), 8, 48), mat(body), { y: h, rx: Math.PI / 2 }));
    cup.add(mesh(new THREE.CircleGeometry(rAt(h * 0.86) - 0.01, 40), mat(coffee), { y: h * 0.86, rx: -Math.PI / 2, cast: false }));

    if (band) {
        const y0 = h * 0.5, y1 = h * 0.64;
        cup.add(mesh(new THREE.CylinderGeometry(rAt(y1) + 0.012, rAt(y0) + 0.012, y1 - y0, 48, 1, true), mat(band), { y: (y0 + y1) / 2 }));
    }
    if (text) {
        const y0 = h * 0.14, y1 = h * 0.46;
        const tex = canvasTexture(2048, 256, (ctx, w, hh) => {
            ctx.fillStyle = textColor;
            ctx.font = "900 150px Fraunces, Georgia, serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, w / 2, hh / 2 + 8);
        });
        tex.wrapS = THREE.RepeatWrapping;
        tex.offset.x = 0.5; // centra el texto hacia el frente (+z)
        cup.add(mesh(new THREE.CylinderGeometry(rAt(y1) + 0.02, rAt(y0) + 0.02, y1 - y0, 48, 1, true),
            new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.7 }), { y: (y0 + y1) / 2, cast: false }));
    }
    if (handle) {
        const R = h * 0.22;
        const arc = Math.PI * 1.15;
        const y = h * 0.52;
        cup.add(mesh(new THREE.TorusGeometry(R, h * 0.055, 12, 32, arc), mat(body), { x: rAt(y) + R * 0.2, y, rz: -arc / 2 }));
    }
    if (saucer) {
        g.add(mesh(new THREE.CylinderGeometry(rBot * 1.95, rBot * 1.55, saucerH, 48), mat(C.white), { y: saucerH / 2 }));
        g.add(mesh(new THREE.TorusGeometry(rBot * 1.93, saucerH * 0.4, 8, 48), mat(C.white), { y: saucerH, rx: Math.PI / 2 }));
    }
    return g;
}

function makeBubble(color = C.yellow, dotColor = C.ink) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.SphereGeometry(1, 32, 24), mat(color), { s: [1.5, 1, 0.55] }));
    g.add(mesh(new THREE.ConeGeometry(0.32, 0.85, 16), mat(color), { x: -0.8, y: -0.85, rz: -0.6 }));
    const dots = [-0.52, 0, 0.52].map((x) => {
        const d = mesh(new THREE.SphereGeometry(0.17, 16, 12), mat(dotColor), { x, z: 0.5 });
        g.add(d);
        return d;
    });
    return { group: g, dots };
}

function glassMat(opacity = 0.28) {
    return new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity, roughness: 0.1, metalness: 0, depthWrite: false, side: THREE.DoubleSide });
}

function plate(r = 1.35) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(r, r * 0.8, 0.12, 40), mat(C.white), { y: 0.06, receive: true }));
    return g;
}

/* ---------- productos en 3D ---------- */

const PRODUCT_BUILDERS = {
    espresso: () => makeCup({ h: 1.25, rTop: 0.9, rBot: 0.66, body: C.white, band: C.orange }),
    cappuccino: () => {
        const g = makeCup({ h: 1.2, rTop: 1.2, rBot: 0.75, body: C.orange, coffee: C.foam, band: null });
        g.add(mesh(new THREE.SphereGeometry(0.22, 16, 12), mat(C.crema), { y: 1.13, s: [1.2, 0.15, 1] }));
        return g;
    },
    latte: () => {
        const g = new THREE.Group();
        const r = 0.72;
        g.add(mesh(new THREE.CylinderGeometry(r * 0.97, r * 0.97, 0.8, 32), mat(0x7A3F17), { y: 0.42 }));
        g.add(mesh(new THREE.CylinderGeometry(r * 0.97, r * 0.97, 0.85, 32), mat(C.milk), { y: 1.25 }));
        g.add(mesh(new THREE.CylinderGeometry(r * 0.97, r * 0.97, 0.5, 32), mat(0xFBF0DC), { y: 1.92 }));
        g.add(mesh(new THREE.CylinderGeometry(r, r, 2.3, 32, 1, true), glassMat(0.3), { y: 1.15, cast: false }));
        g.add(mesh(new THREE.TorusGeometry(0.45, 0.07, 10, 24, Math.PI * 1.1), glassMat(0.5), { x: r + 0.1, y: 1.2, rz: -Math.PI * 0.55, cast: false }));
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            g.add(mesh(new THREE.SphereGeometry(0.15, 12, 8), mat(0xffffff), { x: Math.cos(a) * 0.16, y: 2.22, z: Math.sin(a) * 0.16, s: [1, 0.35, 1.4] }));
        }
        g.add(mesh(new THREE.SphereGeometry(0.08, 10, 8), mat(C.yellow), { y: 2.26 }));
        return g;
    },
    coldbrew: () => {
        const g = new THREE.Group();
        g.add(mesh(new THREE.CylinderGeometry(0.74, 0.62, 2.0, 32), mat(0x4A1E0A), { y: 1.0 }));
        g.add(mesh(new THREE.CylinderGeometry(0.8, 0.66, 2.5, 32, 1, true), glassMat(0.25), { y: 1.25, cast: false }));
        [[0.2, 1.7, 0.2, 0.3], [-0.22, 1.45, -0.1, 0.8], [0.05, 1.15, 0.25, 1.4]].forEach(([x, y, z, r]) =>
            g.add(mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, roughness: 0.1 }), { x, y, z, ry: r, rx: r / 2 })));
        const slice = new THREE.Group();
        slice.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32), mat(0xF39A2B), { rx: Math.PI / 2 }));
        slice.add(mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.11, 32), mat(0xFFC067), { rx: Math.PI / 2 }));
        slice.position.set(0.62, 2.45, 0.15);
        slice.rotation.y = -0.5;
        g.add(slice);
        g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8), mat(C.orange), { x: 0.15, y: 2.2, rz: -0.25 }));
        return g;
    },
    frappe: () => {
        const g = new THREE.Group();
        g.add(mesh(new THREE.CylinderGeometry(0.8, 0.62, 2.0, 32), mat(C.mocha), { y: 1.0 }));
        g.add(mesh(new THREE.CylinderGeometry(0.76, 0.69, 0.55, 32, 1, true), mat(C.white), { y: 1.0 }));
        g.add(mesh(new THREE.SphereGeometry(0.11, 10, 8), mat(C.orange), { y: 1.05, z: 0.74, s: [1, 1, 0.4] }));
        g.add(mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.12, 32), mat(0xffffff), { y: 2.04 }));
        [[0, 2.3, 0, 0.45], [0.32, 2.2, 0.1, 0.3], [-0.3, 2.2, -0.05, 0.32], [0.05, 2.55, 0.05, 0.28]].forEach(([x, y, z, r]) =>
            g.add(mesh(new THREE.SphereGeometry(r, 16, 12), mat(C.white), { x, y, z })));
        g.add(mesh(new THREE.SphereGeometry(0.84, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), glassMat(0.22), { y: 2.08, cast: false }));
        g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 8), mat(C.orange), { x: 0.2, y: 2.8, rz: -0.2 }));
        return g;
    },
    cheesecake: () => {
        const g = plate(1.35);
        const shape = new THREE.Shape();
        shape.moveTo(-1.1, 0); shape.lineTo(1.0, -0.62); shape.quadraticCurveTo(1.25, 0, 1.0, 0.62); shape.lineTo(-1.1, 0);
        const layer = (depth, color, y) => {
            const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 12 });
            const m = mesh(geo, mat(color), { y: y + depth, rx: Math.PI / 2 });
            g.add(m);
        };
        layer(0.18, C.crust, 0.12);
        layer(0.6, C.cheese, 0.3);
        layer(0.14, C.passion, 0.9);
        for (let i = 0; i < 9; i++) {
            g.add(mesh(new THREE.SphereGeometry(0.035, 6, 6), mat(0x2B1A10), { x: -0.5 + Math.random() * 1.3, y: 1.05, z: (Math.random() - 0.5) * 0.5, cast: false }));
        }
        g.add(mesh(new THREE.SphereGeometry(0.16, 12, 8), mat(C.leaf), { x: 0.7, y: 1.1, s: [1.4, 0.3, 0.7], ry: 0.6 }));
        return g;
    },
    brownie: () => {
        const g = plate(1.35);
        g.add(mesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), mat(C.brownie), { y: 0.42, ry: 0.4 }));
        g.add(mesh(new THREE.BoxGeometry(1.0, 0.5, 1.0), mat(C.brownieTop), { y: 0.97, ry: 0.9 }));
        [[0.2, 0.1, 0.3], [-0.2, -0.15, -0.6], [0.05, 0.25, 1.2]].forEach(([x, z, r]) =>
            g.add(mesh(new THREE.SphereGeometry(0.18, 12, 8), mat(C.pecan), { x, y: 1.24, z, ry: r, s: [1.2, 0.4, 0.75] })));
        return g;
    },
    croissant: () => {
        const g = plate(1.35);
        const n = 7;
        for (let i = 0; i < n; i++) {
            const t = i / (n - 1);
            const a = Math.PI * (0.1 + 0.8 * t);
            const size = 0.28 + Math.sin(t * Math.PI) * 0.3;
            g.add(mesh(new THREE.SphereGeometry(size, 18, 14), mat(i % 2 ? C.croissant : 0xD88E37), {
                x: Math.cos(a) * 0.85, y: 0.32 + size * 0.55, z: -Math.sin(a) * 0.55 + 0.25, s: [1, 0.75, 1.1],
            }));
        }
        return g;
    },
};

/* ---------- disposición: estaciones en círculo, mirando hacia afuera ---------- */

const R_ISLAND = 22;
const R_ROAD = 19.5;
const STATION = {
    inicio: { a: 0, r: 9 },
    marca: { a: -60, r: 10 },
    carta: { a: 60, r: 10 },
    reto: { a: -130, r: 10 },
    local: { a: 180, r: 10 },
};
function placeAt(obj, key) {
    const { a, r } = STATION[key];
    const rad = (a * Math.PI) / 180;
    obj.position.set(Math.sin(rad) * r, 0, Math.cos(rad) * r);
    obj.rotation.y = rad;
}
function stationView(key, dist, height, lookY) {
    const { a, r } = STATION[key];
    const rad = (a * Math.PI) / 180;
    const out = new THREE.Vector3(Math.sin(rad), 0, Math.cos(rad));
    const base = out.clone().multiplyScalar(r);
    return { pos: base.clone().addScaledVector(out, dist).add(new THREE.Vector3(0, height, 0)), tgt: base.clone().add(new THREE.Vector3(0, lookY, 0)) };
}

/* ---------- el mundo ---------- */

async function start() {
    if (document.fonts) {
        await Promise.race([
            document.fonts.load('900 120px "Fraunces"'),
            new Promise((r) => setTimeout(r, 1800)),
        ]).catch(() => {});
    }

    let mobile = mobileQuery.matches;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = canvasTexture(16, 512, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#FFD9A6");
        g.addColorStop(0.45, "#FFEFD9");
        g.addColorStop(1, "#E8F1EE");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    });
    scene.fog = new THREE.Fog(0xFFEEDB, 60, 130);

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 220);

    scene.add(new THREE.HemisphereLight(0xFFF6E8, 0xE0B98A, 1.35));
    const sun = new THREE.DirectionalLight(0xFFFFFF, 1.9);
    sun.position.set(14, 24, 16);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 80 });
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0.04;
    sun.shadow.radius = 4;
    scene.add(sun);

    const animated = [];   // funciones (t, dt) => void
    const clickables = []; // { object, onClick, label }

    /* isla */
    const floorTex = canvasTexture(512, 512, (ctx, w, h) => {
        const n = 8, s = w / n;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
            ctx.fillStyle = (i + j) % 2 ? "#F7E4C8" : "#FDF4E6";
            ctx.fillRect(i * s, j * s, s, s);
        }
        ctx.strokeStyle = "rgba(36,22,15,0.08)";
        ctx.lineWidth = 3;
        for (let i = 0; i <= n; i++) {
            ctx.beginPath(); ctx.moveTo(i * s, 0); ctx.lineTo(i * s, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * s); ctx.lineTo(w, i * s); ctx.stroke();
        }
    });
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(10, 10);
    floorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const island = new THREE.Group();
    scene.add(island);
    island.add(mesh(new THREE.CircleGeometry(R_ISLAND, 128), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85 }), { y: 0.001, rx: -Math.PI / 2, cast: false, receive: true }));
    island.add(mesh(new THREE.CylinderGeometry(R_ISLAND, R_ISLAND - 3, 2.6, 128), mat(C.teal), { y: -1.3, cast: false }));
    island.add(mesh(new THREE.CylinderGeometry(R_ISLAND - 3, 4, 9, 64), mat(C.tealDeep), { y: -7.1, cast: false }));
    island.add(mesh(new THREE.TorusGeometry(R_ISLAND, 0.22, 10, 160), mat(C.orange), { y: 0.02, rx: Math.PI / 2, cast: false }));

    // camino del delivery
    island.add(mesh(new THREE.RingGeometry(R_ROAD - 1.0, R_ROAD + 1.0, 160), mat(0x3A2A22), { y: 0.02, rx: -Math.PI / 2, cast: false, receive: true }));
    const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.8, 0.03, 0.14), mat(C.yellow), 80);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 80; i++) {
        const a = (i / 80) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * R_ROAD, 0.04, Math.sin(a) * R_ROAD);
        dummy.rotation.y = -a + Math.PI / 2;
        dummy.updateMatrix();
        dashes.setMatrixAt(i, dummy.matrix);
    }
    island.add(dashes);

    // rocas flotantes bajo la isla
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.4;
        const rock = mesh(new THREE.DodecahedronGeometry(0.6 + (i % 3) * 0.35), mat(i % 2 ? C.teal : C.tealDeep, { flatShading: true }), { x: Math.cos(a) * (R_ISLAND + 2), y: -4.5 - (i % 3), z: Math.sin(a) * (R_ISLAND + 2), cast: false });
        scene.add(rock);
        const base = rock.position.y;
        animated.push((t) => { rock.position.y = base + Math.sin(t * 0.6 + i) * 0.35; rock.rotation.y = t * 0.1 + i; });
    }

    // nubes
    const cloudMat = mat(0xFFFFFF, { roughness: 1, emissive: 0xFFF3E6, emissiveIntensity: 0.25 });
    for (let i = 0; i < 7; i++) {
        const cl = new THREE.Group();
        [[0, 0, 0, 1.6], [1.5, -0.2, 0.3, 1.2], [-1.4, -0.3, -0.2, 1.1], [0.5, 0.6, 0, 1]].forEach(([x, y, z, r]) => cl.add(mesh(new THREE.SphereGeometry(r, 16, 12), cloudMat, { x, y, z, cast: false })));
        const a = (i / 7) * Math.PI * 2;
        const R = 34 + (i % 3) * 6;
        cl.position.set(Math.cos(a) * R, 8 + (i % 4) * 3, Math.sin(a) * R);
        cl.scale.setScalar(0.9 + (i % 3) * 0.35);
        scene.add(cl);
        animated.push((t) => { const aa = a + t * 0.012; cl.position.x = Math.cos(aa) * R; cl.position.z = Math.sin(aa) * R; });
    }

    /* plaza central con árbol */
    const plaza = new THREE.Group();
    scene.add(plaza);
    plaza.add(mesh(new THREE.CylinderGeometry(3.2, 3.4, 0.5, 48), mat(C.orange), { y: 0.25, receive: true }));
    plaza.add(mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.06, 48), mat(0x7A4E2D), { y: 0.52, cast: false, receive: true }));
    plaza.add(mesh(new THREE.CylinderGeometry(0.35, 0.5, 3.2, 12), mat(0x7A4E2D), { y: 2.1 }));
    [[0, 4.4, 0, 2.2], [1.1, 3.8, 0.6, 1.5], [-1.1, 3.9, -0.4, 1.6], [0.2, 5.6, -0.3, 1.5]].forEach(([x, y, z, r]) =>
        plaza.add(mesh(new THREE.IcosahedronGeometry(r, 1), mat(C.leaf, { flatShading: true }), { x, y, z })));
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const bench = new THREE.Group();
        bench.position.set(Math.sin(a) * 5, 0, Math.cos(a) * 5);
        bench.rotation.y = a;
        bench.add(mesh(new THREE.BoxGeometry(2.2, 0.15, 0.7), mat(C.teal), { y: 0.6 }));
        bench.add(mesh(new THREE.BoxGeometry(2.2, 0.7, 0.12), mat(C.teal), { y: 1.0, z: -0.32 }));
        [-0.9, 0.9].forEach((x) => bench.add(mesh(new THREE.BoxGeometry(0.12, 0.6, 0.6), mat(C.ink), { x, y: 0.3 })));
        plaza.add(bench);
    }

    /* estación 0 — la gran taza de bienvenida */
    const hero = new THREE.Group();
    placeAt(hero, "inicio");
    hero.rotation.y = 0;
    scene.add(hero);
    const bigCup = makeCup({ h: 2.6, rTop: 2.0, rBot: 1.45, text: "Contexto" });
    hero.add(bigCup);
    animated.push((t) => { bigCup.rotation.y = Math.sin(t * 0.35) * 0.35; });

    const steamTex = canvasTexture(64, 64, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    });
    function addSteam(parent, y, spread, count, scale = 1) {
        const parts = [];
        for (let i = 0; i < count; i++) {
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0 }));
            sp.userData.phase = i / count;
            sp.userData.x = (Math.random() - 0.5) * spread;
            sp.userData.z = (Math.random() - 0.5) * spread;
            parent.add(sp);
            parts.push(sp);
        }
        animated.push((t) => {
            parts.forEach((sp) => {
                const k = (t * 0.28 + sp.userData.phase) % 1;
                sp.position.set(sp.userData.x + Math.sin(k * 6 + sp.userData.phase * 9) * 0.25 * scale, y + k * 2.6 * scale, sp.userData.z);
                sp.scale.setScalar((0.5 + k * 1.1) * scale);
                sp.material.opacity = Math.sin(k * Math.PI) * 0.6;
            });
        });
    }
    addSteam(hero, 2.9, 1.6, 18);

    const { group: bubble, dots } = makeBubble(C.yellow, C.ink);
    bubble.position.set(2.9, 5.6, 9.6);
    bubble.scale.setScalar(1.05);
    scene.add(bubble);
    animated.push((t) => {
        bubble.position.y = 5.6 + Math.sin(t * 1.2) * 0.18;
        bubble.rotation.y = Math.sin(t * 0.5) * 0.25 - 0.25;
        dots.forEach((d, i) => { const k = (t * 1.6 - i * 0.18) % 1.6; d.position.y = k < 0.4 ? Math.sin((k / 0.4) * Math.PI) * 0.22 : 0; });
    });
    clickables.push({ object: bubble, label: "Abrir el chat", onClick: () => window.ContextoChat?.open() });

    // granos que orbitan
    const beanMat = mat(0x6B3416);
    for (let i = 0; i < 6; i++) {
        const bean = mesh(new THREE.SphereGeometry(0.22, 14, 10), beanMat, { s: [1, 0.65, 1.35] });
        scene.add(bean);
        animated.push((t) => {
            const a = t * 0.35 + (i / 6) * Math.PI * 2;
            bean.position.set(Math.cos(a) * 3.6, 2.2 + Math.sin(t * 0.9 + i) * 0.8, 9 + Math.sin(a) * 3.6);
            bean.rotation.set(t + i, t * 0.7, 0);
        });
    }

    /* estación 1 — la marca: un dato, un sorbo, un buen rato */
    const brand = new THREE.Group();
    placeAt(brand, "marca");
    scene.add(brand);
    const pedestals = [
        { x: -2.6, color: C.yellow },
        { x: 0, color: C.orange },
        { x: 2.6, color: C.mint },
    ];
    pedestals.forEach((p) => {
        brand.add(mesh(new THREE.CylinderGeometry(0.95, 1.05, 1.1, 40), mat(p.color), { x: p.x, y: 0.55, receive: true }));
        brand.add(mesh(new THREE.TorusGeometry(0.98, 0.06, 8, 40), mat(C.ink), { x: p.x, y: 1.1, rx: Math.PI / 2 }));
    });
    // foco
    const bulb = new THREE.Group();
    bulb.add(mesh(new THREE.SphereGeometry(0.55, 24, 18), mat(0xFFE08A, { emissive: 0xF7B13C, emissiveIntensity: 0.6 }), { y: 0.55 }));
    bulb.add(mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.4, 16), mat(C.ink), { y: -0.05 }));
    bulb.position.set(-2.6, 1.7, 0);
    brand.add(bulb);
    const bulbLight = new THREE.PointLight(0xF7B13C, 4, 5, 2);
    bulbLight.position.set(-2.6, 2.4, 0.6);
    brand.add(bulbLight);
    // taza
    const brandCup = makeCup({ h: 0.9, rTop: 0.62, rBot: 0.45, body: C.white, band: C.orange });
    brandCup.position.set(0, 1.12, 0);
    brand.add(brandCup);
    addSteam(brandCup, 1.0, 0.4, 8, 0.45);
    // globo
    const { group: brandBubble, dots: bDots } = makeBubble(C.teal, C.light);
    brandBubble.scale.setScalar(0.55);
    brandBubble.position.set(2.6, 2.0, 0);
    brand.add(brandBubble);
    animated.push((t) => {
        bulb.position.y = 1.7 + Math.sin(t * 1.4) * 0.12;
        bulb.rotation.y = t * 0.6;
        bulbLight.intensity = 3 + Math.sin(t * 3) * 1.2;
        brandCup.rotation.y = t * 0.5;
        brandBubble.position.y = 2.0 + Math.sin(t * 1.4 + 1) * 0.12;
        brandBubble.rotation.y = Math.sin(t * 0.7) * 0.4;
        bDots.forEach((d, i) => { const k = (t * 1.6 - i * 0.18) % 1.6; d.position.y = k < 0.4 ? Math.sin((k / 0.4) * Math.PI) * 0.22 : 0; });
    });

    /* estación 2 — la vitrina con la carta */
    const counter = new THREE.Group();
    placeAt(counter, "carta");
    scene.add(counter);
    counter.add(mesh(new THREE.BoxGeometry(9.4, 1.5, 2.1), mat(C.teal), { y: 0.75, receive: true }));
    counter.add(mesh(new THREE.BoxGeometry(9.7, 0.16, 2.4), mat(C.light), { y: 1.58, receive: true }));
    counter.add(mesh(new THREE.BoxGeometry(9.4, 0.12, 0.05), mat(C.orange), { y: 1.2, z: 1.06, cast: false }));
    counter.add(mesh(new THREE.BoxGeometry(10.2, 5.2, 0.25), mat(C.orange), { y: 2.6, z: -2.0, receive: true }));
    counter.add(mesh(new THREE.BoxGeometry(9.4, 0.16, 1.0), mat(C.light), { y: 3.25, z: -1.4, receive: true }));
    const board = canvasTexture(1024, 256, (ctx, w, h) => {
        ctx.fillStyle = "#24160F"; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#FBF1E3"; ctx.font = "900 120px Fraunces, Georgia, serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("Nuestra carta", w / 2, h / 2 + 6);
    });
    counter.add(mesh(new THREE.PlaneGeometry(5.2, 1.3), new THREE.MeshStandardMaterial({ map: board, roughness: 0.9 }), { y: 4.45, z: -1.86, cast: false }));

    const productObjects = new Map();
    // PRODUCTS viene de products.js (script clásico cargado antes que este módulo)
    const prods = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
    prods.forEach((p, i) => {
        const build = PRODUCT_BUILDERS[p.art];
        if (!build) return;
        const obj = build();
        const front = i < 4;
        const col = i % 4;
        obj.scale.setScalar(front ? 0.62 : 0.52);
        const baseY = front ? 1.66 : 3.33;
        obj.position.set(-3.4 + col * 2.27, baseY, front ? 0.2 : -1.4);
        obj.userData = { id: p.id, baseY, hover: 0 };
        counter.add(obj);
        productObjects.set(p.id, obj);
        clickables.push({ object: obj, label: `${p.name} · S/ ${p.price.toFixed(2)}`, hint: "Toca para agregar", product: p });
    });

    /* estación 3 — minibiblioteca y reto */
    const library = new THREE.Group();
    placeAt(library, "reto");
    scene.add(library);
    library.add(mesh(new THREE.BoxGeometry(4.6, 4.6, 0.15), mat(C.tealDeep), { y: 2.3, z: -0.55, receive: true }));
    [-2.3, 2.3].forEach((x) => library.add(mesh(new THREE.BoxGeometry(0.18, 4.7, 1.25), mat(C.teal), { x, y: 2.35 })));
    library.add(mesh(new THREE.BoxGeometry(4.8, 0.2, 1.3), mat(C.teal), { y: 4.7 }));
    const bookColors = [C.orange, C.yellow, C.raspberry, C.mint, C.light, C.navy, 0x4E6B3A];
    for (let s = 0; s < 3; s++) {
        const y = 0.45 + s * 1.45;
        library.add(mesh(new THREE.BoxGeometry(4.3, 0.1, 1.0), mat(C.light), { y, z: 0.12, receive: true }));
        let x = -1.95;
        let k = s * 3;
        while (x < 1.85) {
            const w = 0.22 + ((k * 37) % 5) * 0.05;
            const hgt = 0.8 + ((k * 13) % 4) * 0.12;
            const tilt = k % 7 === 3 ? 0.25 : 0;
            library.add(mesh(new THREE.BoxGeometry(w, hgt, 0.75), mat(bookColors[k % bookColors.length]), { x: x + w / 2, y: y + 0.05 + hgt / 2, z: 0.2, rz: tilt }));
            x += w + 0.04 + tilt * 0.4;
            k++;
        }
    }
    // celular gigante con QR
    const phone = new THREE.Group();
    phone.position.set(3.4, 2.1, 0.6);
    phone.rotation.y = -0.35;
    library.add(phone);
    phone.add(mesh(new THREE.BoxGeometry(2.0, 3.8, 0.22), mat(C.ink), {}));
    const qrTex = canvasTexture(512, 960, (ctx, w, h) => {
        ctx.fillStyle = "#FFFAF3"; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#24160F";
        ctx.font = "900 64px Fraunces, Georgia, serif"; ctx.textAlign = "center";
        ctx.fillText("¿Real o", w / 2, 120); ctx.fillText("falso?", w / 2, 190);
        const size = 340, x0 = (w - size) / 2, y0 = 260, n = 21, c = size / n;
        let seed = 7;
        const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (rnd() > 0.52) ctx.fillRect(x0 + i * c, y0 + j * c, c, c);
        [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([i, j]) => {
            ctx.fillStyle = "#24160F"; ctx.fillRect(x0 + i * c, y0 + j * c, 7 * c, 7 * c);
            ctx.fillStyle = "#FFFAF3"; ctx.fillRect(x0 + (i + 1) * c, y0 + (j + 1) * c, 5 * c, 5 * c);
            ctx.fillStyle = "#E87A14"; ctx.fillRect(x0 + (i + 2) * c, y0 + (j + 2) * c, 3 * c, 3 * c);
        });
        ctx.fillStyle = "#E87A14"; ctx.beginPath(); ctx.roundRect(70, 680, w - 140, 110, 55); ctx.fill();
        ctx.fillStyle = "#24160F"; ctx.font = "800 46px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("Escanea y gana", w / 2, 750);
        ctx.font = "600 36px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("de 5% a 10% de descuento", w / 2, 860);
    });
    phone.add(mesh(new THREE.PlaneGeometry(1.8, 3.4), new THREE.MeshStandardMaterial({ map: qrTex, roughness: 0.6 }), { z: 0.115, cast: false }));
    // fichas de verdadero / falso
    const badge = (color, draw) => {
        const tex = canvasTexture(256, 256, (ctx, w, h) => {
            ctx.fillStyle = css(color); ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#FFFAF3"; ctx.lineWidth = 26; ctx.lineCap = "round"; ctx.lineJoin = "round";
            draw(ctx, w, h);
        });
        const b = new THREE.Group();
        b.add(mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.14, 40), mat(color), { rx: Math.PI / 2 }));
        b.add(mesh(new THREE.CircleGeometry(0.55, 40), new THREE.MeshStandardMaterial({ map: tex, transparent: true }), { z: 0.075, cast: false }));
        b.add(mesh(new THREE.CircleGeometry(0.55, 40), new THREE.MeshStandardMaterial({ map: tex, transparent: true }), { z: -0.075, ry: Math.PI, cast: false }));
        return b;
    };
    const yes = badge(0x2E6A35, (ctx) => { ctx.beginPath(); ctx.moveTo(70, 132); ctx.lineTo(112, 176); ctx.lineTo(188, 88); ctx.stroke(); });
    const no = badge(0xB0281A, (ctx) => { ctx.beginPath(); ctx.moveTo(84, 84); ctx.lineTo(172, 172); ctx.moveTo(172, 84); ctx.lineTo(84, 172); ctx.stroke(); });
    yes.position.set(1.9, 4.6, 1.2);
    no.position.set(4.9, 4.3, 1.0);
    library.add(yes, no);
    animated.push((t) => {
        yes.position.y = 4.6 + Math.sin(t * 1.3) * 0.2; yes.rotation.y = Math.sin(t * 0.8) * 0.6;
        no.position.y = 4.3 + Math.sin(t * 1.3 + 2) * 0.2; no.rotation.y = Math.sin(t * 0.8 + 1) * 0.6;
        phone.position.y = 2.1 + Math.sin(t * 0.9) * 0.08;
    });
    // mesita de lectura
    const table = new THREE.Group();
    table.position.set(0.6, 0, 2.6);
    library.add(table);
    table.add(mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.12, 32), mat(C.light), { y: 1.1, receive: true }));
    table.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.1, 12), mat(C.ink), { y: 0.55 }));
    table.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 24), mat(C.ink), { y: 0.03 }));
    const miniCup = makeCup({ h: 0.42, rTop: 0.28, rBot: 0.2, saucer: false, body: C.orange, band: null, handle: true });
    miniCup.position.set(-0.3, 1.16, 0.2);
    table.add(miniCup);
    table.add(mesh(new THREE.BoxGeometry(0.7, 0.1, 0.5), mat(C.raspberry), { x: 0.35, y: 1.21, z: -0.1, ry: 0.4 }));

    /* estación 4 — la moto del delivery */
    const scooter = new THREE.Group();
    scene.add(scooter);
    const sc = new THREE.Group();
    sc.scale.setScalar(0.9);
    scooter.add(sc);
    const wheel = (x) => {
        const w = new THREE.Group();
        w.add(mesh(new THREE.TorusGeometry(0.42, 0.16, 12, 28), mat(C.ink), {}));
        w.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.2, 16), mat(0xB9B0A6), { rx: Math.PI / 2 }));
        w.position.set(x, 0.58, 0);
        sc.add(w);
        return w;
    };
    const wheels = [wheel(-1.0), wheel(1.15)];
    sc.add(mesh(new THREE.BoxGeometry(1.6, 0.25, 0.6), mat(C.orange), { x: 0.1, y: 0.85 }));
    sc.add(mesh(new THREE.SphereGeometry(0.7, 20, 14), mat(C.orange), { x: -0.75, y: 1.15, s: [1.1, 0.75, 0.8] }));
    sc.add(mesh(new THREE.BoxGeometry(0.9, 0.18, 0.55), mat(C.ink), { x: -0.7, y: 1.58 }));
    sc.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.6, 10), mat(C.ink), { x: 1.0, y: 1.5, rz: 0.3 }));
    sc.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 10), mat(C.ink), { x: 0.78, y: 2.3, rx: Math.PI / 2 }));
    sc.add(mesh(new THREE.SphereGeometry(0.16, 12, 10), mat(0xFFF1B8, { emissive: 0xF7B13C, emissiveIntensity: 0.8 }), { x: 1.08, y: 1.95 }));
    const boxTex = canvasTexture(256, 256, (ctx, w, h) => {
        ctx.fillStyle = "#FFF8EC"; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#E87A14"; ctx.beginPath(); ctx.arc(w / 2, 92, 34, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#24160F"; ctx.font = "900 50px Fraunces, Georgia, serif"; ctx.textAlign = "center";
        ctx.fillText("Contexto", w / 2, 190);
    });
    const boxMats = [mat(C.white), mat(C.white), mat(C.white), mat(C.white), new THREE.MeshStandardMaterial({ map: boxTex }), new THREE.MeshStandardMaterial({ map: boxTex })];
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.85, 0.95), boxMats);
    box.position.set(-1.2, 2.1, 0);
    box.castShadow = true;
    sc.add(box);
    // repartidor
    sc.add(mesh(new THREE.CapsuleGeometry(0.3, 0.6, 6, 12), mat(C.teal), { x: -0.45, y: 2.1 }));
    sc.add(mesh(new THREE.SphereGeometry(0.3, 16, 12), mat(0xC98B5B), { x: -0.35, y: 2.75 }));
    sc.add(mesh(new THREE.SphereGeometry(0.33, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(C.yellow), { x: -0.35, y: 2.8 }));

    const ROAD_R = R_ROAD;
    let scooterAngle = 0.9;
    const scooterPos = new THREE.Vector3();
    const scooterDir = new THREE.Vector3();
    function placeScooter(a) {
        scooter.position.set(Math.cos(a) * ROAD_R, 0, Math.sin(a) * ROAD_R);
        scooter.rotation.y = -a; // mirando en la dirección del recorrido
        scooterPos.copy(scooter.position);
        scooterDir.set(-Math.sin(a), 0, Math.cos(a));
    }
    placeScooter(scooterAngle);
    animated.push((t, dt) => {
        if (reduceMotion.matches) return;
        scooterAngle += dt * 0.16;
        placeScooter(scooterAngle);
        wheels.forEach((w) => (w.rotation.z -= dt * 6));
        sc.position.y = Math.abs(Math.sin(t * 9)) * 0.04;
    });

    /* estación 5 — el local */
    const shop = new THREE.Group();
    placeAt(shop, "local");
    scene.add(shop);
    shop.add(mesh(new THREE.BoxGeometry(8.4, 4.2, 4.2), mat(C.light), { y: 2.1, receive: true }));
    shop.add(mesh(new THREE.BoxGeometry(9.0, 0.4, 4.8), mat(C.teal), { y: 4.4 }));
    shop.add(mesh(new THREE.BoxGeometry(8.4, 0.5, 4.2), mat(C.orange), { y: 0.25, receive: true }));
    // letrero
    const sign = canvasTexture(1024, 256, (ctx, w, h) => {
        ctx.fillStyle = "#1D5457"; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 60); ctx.fill();
        ctx.fillStyle = "#E87A14"; ctx.beginPath(); ctx.arc(150, h / 2, 34, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#FFFAF3"; ctx.font = "900 150px Fraunces, Georgia, serif"; ctx.textBaseline = "middle";
        ctx.fillText("Contexto", 220, h / 2 + 10);
    });
    shop.add(mesh(new THREE.PlaneGeometry(5.6, 1.4), new THREE.MeshStandardMaterial({ map: sign, transparent: true, roughness: 0.6 }), { y: 3.55, z: 2.12, cast: false }));
    // toldo a rayas
    const stripes = canvasTexture(512, 64, (ctx, w, h) => {
        const n = 12;
        for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? "#FFFAF3" : "#E87A14"; ctx.fillRect((w / n) * i, 0, w / n, h); }
    });
    const awning = mesh(new THREE.PlaneGeometry(8.6, 1.7), new THREE.MeshStandardMaterial({ map: stripes, side: THREE.DoubleSide, roughness: 0.8 }), { y: 2.55, z: 2.75, rx: -1.0 });
    shop.add(awning);
    const scallop = new THREE.InstancedMesh(new THREE.SphereGeometry(0.36, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat(C.orange, { side: THREE.DoubleSide }), 12);
    for (let i = 0; i < 12; i++) {
        dummy.position.set(-4.3 + 0.36 + i * 0.72, 2.08, 3.43);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 0.7, 0.3);
        dummy.updateMatrix();
        scallop.setMatrixAt(i, dummy.matrix);
    }
    shop.add(scallop);
    // puerta y ventanas
    shop.add(mesh(new THREE.BoxGeometry(1.4, 2.4, 0.1), mat(C.ink), { y: 1.7, z: 2.12 }));
    shop.add(mesh(new THREE.SphereGeometry(0.07, 10, 8), mat(C.yellow), { x: 0.45, y: 1.7, z: 2.2 }));
    [-2.6, 2.6].forEach((x) => {
        shop.add(mesh(new THREE.BoxGeometry(2.0, 1.6, 0.1), mat(C.ink), { x, y: 1.9, z: 2.12 }));
        shop.add(mesh(new THREE.PlaneGeometry(1.8, 1.4), mat(0xFFE3A3, { emissive: 0xF7B13C, emissiveIntensity: 0.55 }), { x, y: 1.9, z: 2.18, cast: false }));
        shop.add(mesh(new THREE.BoxGeometry(0.06, 1.4, 0.05), mat(C.ink), { x, y: 1.9, z: 2.2, cast: false }));
    });
    // taza en el techo
    const roofCup = makeCup({ h: 1.4, rTop: 1.0, rBot: 0.72, body: C.white, band: C.orange });
    roofCup.position.set(2.4, 4.6, 0);
    shop.add(roofCup);
    addSteam(roofCup, 1.6, 0.8, 10, 0.7);
    // mesas con sombrilla
    [[-3.6, 4.8, C.yellow], [3.6, 4.6, C.mint]].forEach(([x, z, color]) => {
        const tb = new THREE.Group();
        tb.position.set(x, 0, z);
        shop.add(tb);
        tb.add(mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.1, 28), mat(C.light), { y: 1.0, receive: true }));
        tb.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.0, 10), mat(C.ink), { y: 1.5 }));
        tb.add(mesh(new THREE.ConeGeometry(1.7, 0.8, 8), mat(color), { y: 3.2 }));
        [-1.1, 1.1].forEach((sx) => tb.add(mesh(new THREE.BoxGeometry(0.6, 0.12, 0.6), mat(C.orange), { x: sx, y: 0.6 })));
        const mc = makeCup({ h: 0.38, rTop: 0.25, rBot: 0.18, saucer: false, body: C.white, band: C.orange });
        mc.position.set(0.2, 1.05, 0);
        tb.add(mc);
    });
    // plantas
    [[-4.9, 1.6], [4.9, 1.6], [-4.9, -1.6], [4.9, -1.6]].forEach(([x, z], i) => {
        shop.add(mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.6, 16), mat(i % 2 ? C.orange : C.teal), { x, y: 0.3, z }));
        shop.add(mesh(new THREE.IcosahedronGeometry(0.62, 1), mat(C.leaf, { flatShading: true }), { x, y: 1.05, z }));
    });

    /* ---------- cámara por estaciones ---------- */

    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const KF = {
        inicio: { ...stationView("inicio", 15, 5.8, 2.8), side: "left" },
        marca: { ...stationView("marca", 16, 6.5, 1.8), side: "right" },
        carta: { ...stationView("carta", 21, 8.5, 2.2), side: "left" },
        reto: { ...stationView("reto", 17, 7, 2.6), side: "right" },
        delivery: { follow: true, side: "left" },
        visitanos: { ...stationView("local", 27, 13, 2.2), side: "right" },
    };
    const sections = [...document.querySelectorAll(".scene[data-station]")];

    function keyframe(name) {
        const k = KF[name] || KF.inicio;
        if (!k.follow) return k;
        const out = V(0, 0, 0).copy(scooterPos).multiplyScalar(1.5).add(V(0, 8, 0)).addScaledVector(scooterDir, -8);
        return { pos: out, tgt: V(0, 1.4, 0).add(scooterPos).addScaledVector(scooterDir, 1.5), side: k.side };
    }

    const camPos = V(0, 0, 0).copy(KF.inicio.pos);
    const camTgt = V(0, 0, 0).copy(KF.inicio.tgt);
    const wantPos = V(0, 0, 0);
    const wantTgt = V(0, 0, 0);
    let shiftX = 0, shiftY = 0;
    let activeIndex = -1;

    function scrollState() {
        const vh = window.innerHeight;
        const centers = sections.map((s) => { const r = s.getBoundingClientRect(); return r.top + r.height / 2 - vh / 2; });
        let i = 0;
        for (let k = 0; k < centers.length; k++) if (centers[k] <= 0) i = k;
        let t = 0;
        if (i < centers.length - 1 && centers[i] <= 0) t = Math.min(1, Math.max(0, -centers[i] / (centers[i + 1] - centers[i])));
        if (centers[0] > 0) { i = 0; t = 0; }
        return { i, t };
    }

    function sideShift(side) {
        // en celular: en la portada el 3D va abajo del título; en el resto, arriba del panel
        if (mobile) return { x: 0, y: side === "hero" ? 0.2 : -0.24 };
        return { x: side === "left" || side === "hero" ? 0.24 : -0.24, y: 0 };
    }

    function computeWanted() {
        const { i, t } = scrollState();
        const a = sections[i], b = sections[Math.min(i + 1, sections.length - 1)];
        const ka = keyframe(a.dataset.station), kb = keyframe(b.dataset.station);
        const e = smooth(t);
        wantPos.lerpVectors(ka.pos, kb.pos, e);
        wantTgt.lerpVectors(ka.tgt, kb.tgt, e);
        if (mobile) wantPos.sub(wantTgt).multiplyScalar(1.45).add(wantTgt);
        const sa = sideShift(i === 0 ? "hero" : ka.side), sb = sideShift(i + 1 === 0 ? "hero" : kb.side);
        const sx = lerp(sa.x, sb.x, e), sy = lerp(sa.y, sb.y, e);
        const near = t < 0.5 ? i : Math.min(i + 1, sections.length - 1);
        if (near !== activeIndex) {
            activeIndex = near;
            sections.forEach((s, k) => s.classList.toggle("is-active", k === near));
            document.dispatchEvent(new CustomEvent("station", { detail: sections[near].id }));
        }
        return { sx, sy };
    }

    /* ---------- interacción con el puntero ---------- */

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);
    const pointerPx = { x: 0, y: 0 };
    let hovered = null;
    let highlightId = null;
    const parallax = { x: 0, y: 0 };

    function pick() {
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(clickables.map((c) => c.object), true);
        if (!hits.length) return null;
        let o = hits[0].object;
        while (o) {
            const c = clickables.find((cc) => cc.object === o);
            if (c) return c;
            o = o.parent;
        }
        return null;
    }

    canvas.addEventListener("pointermove", (e) => {
        pointerPx.x = e.clientX; pointerPx.y = e.clientY;
        pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
        parallax.x = pointer.x; parallax.y = pointer.y;
    });
    canvas.addEventListener("pointerleave", () => { pointer.set(-10, -10); });
    canvas.addEventListener("click", (e) => {
        pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
        const c = pick();
        if (!c) return;
        if (c.product && typeof window.addToCart === "function") {
            const ghost = document.createElement("div");
            ghost.style.cssText = `position:fixed;left:${e.clientX - 20}px;top:${e.clientY - 20}px;width:40px;height:40px;pointer-events:none;`;
            document.body.appendChild(ghost);
            window.addToCart(c.product.id, ghost);
            setTimeout(() => ghost.remove(), 900);
            const obj = productObjects.get(c.product.id);
            if (obj) obj.userData.hop = 1;
        } else if (c.onClick) {
            c.onClick();
        }
    });

    // resaltar el producto 3D cuando se pasa por su tarjeta en la carta
    document.getElementById("menuGrid")?.addEventListener("pointerover", (e) => {
        const card = e.target.closest(".product-card");
        const btn = card?.querySelector("[data-add]");
        highlightId = btn ? Number(btn.dataset.add) : null;
    });
    document.getElementById("menuGrid")?.addEventListener("pointerleave", () => { highlightId = null; });

    function updateTip(c) {
        if (!tipEl) return;
        if (!c) { tipEl.hidden = true; canvas.style.cursor = ""; return; }
        canvas.style.cursor = "pointer";
        tipEl.hidden = false;
        tipEl.innerHTML = `<strong></strong>${c.hint ? "<span></span>" : ""}`;
        tipEl.querySelector("strong").textContent = c.label;
        if (c.hint) tipEl.querySelector("span").textContent = c.hint;
        tipEl.style.transform = `translate(${pointerPx.x + 16}px, ${pointerPx.y + 16}px)`;
    }

    /* ---------- bucle ---------- */

    function resize() {
        mobile = mobileQuery.matches;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.fov = mobile ? 50 : 40;
        camera.updateProjectionMatrix();
        renderer.shadowMap.enabled = !mobile;
    }
    window.addEventListener("resize", resize);
    resize();

    const clock = new THREE.Clock();
    let first = true;
    let time = 0;

    function frame() {
        const dt = Math.min(clock.getDelta(), 0.05);
        const still = reduceMotion.matches;
        time += still ? 0 : dt;

        animated.forEach((fn) => fn(time, still ? 0 : dt));

        const { sx, sy } = computeWanted();
        const k = first ? 1 : 1 - Math.exp(-dt * (still ? 12 : 3.2));
        camPos.lerp(wantPos, k);
        camTgt.lerp(wantTgt, k);
        shiftX = lerp(shiftX, sx, k);
        shiftY = lerp(shiftY, sy, k);

        camera.position.copy(camPos);
        if (!mobile && !still) camera.position.add(V(parallax.x * 0.6, parallax.y * 0.35, 0));
        camera.lookAt(camTgt);
        const w = window.innerWidth, h = window.innerHeight;
        camera.setViewOffset(w, h, -shiftX * w, -shiftY * h, w, h);

        // productos: flotan al pasar el puntero o su tarjeta
        const hit = pointer.x > -2 ? pick() : null;
        if (hit !== hovered) hovered = hit;
        updateTip(hovered);
        productObjects.forEach((obj, id) => {
            const on = (hovered && hovered.product && hovered.product.id === id) || highlightId === id;
            obj.userData.hover = lerp(obj.userData.hover, on ? 1 : 0, 1 - Math.exp(-dt * 10));
            if (obj.userData.hop) obj.userData.hop = Math.max(0, obj.userData.hop - dt * 2.2);
            const hop = obj.userData.hop ? Math.sin((1 - obj.userData.hop) * Math.PI) * 0.6 : 0;
            obj.position.y = obj.userData.baseY + obj.userData.hover * 0.35 + hop;
            obj.rotation.y = obj.userData.hover * Math.sin(time * 2) * 0.35 + (still ? 0 : Math.sin(time * 0.4 + id) * 0.08);
        });

        renderer.render(scene, camera);
        if (first) { first = false; finish(); }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}
