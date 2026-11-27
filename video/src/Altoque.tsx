import "@fontsource/anton/400.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ALT } from "./altData";

// Promo for the "Baterías Altoque" battery shop (9:16, ~36 s).
const FPS = 30;
const W = 1080;
const H = 1920;
const YEL = "#FFD500";
const RED = "#E10600";
const INK = "#0b0b0b";
const CAPS = "Anton, sans-serif";
const SANS = "Montserrat, sans-serif";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sec = (s: number) => Math.round(s * FPS);
const pop = (f: number, at: number, d = 12) =>
  spring({ frame: f - at, fps: FPS, config: { damping: d } });

type Word = { w: string; f: number; e: number };
const WORDS: Word[] = ALT.lines.flatMap((l) => l.words as readonly Word[]);
const wordAt = (txt: string, from = 0) =>
  WORDS.find((w) => w.f >= from && w.w.toLowerCase().includes(txt.toLowerCase()))!.f;

// Scene boundaries (frames).
const SC = {
  hook: [0, sec(5)],
  brand: [sec(5), sec(10.3)],
  montage: [sec(10.3), sec(19.5)],
  features: [sec(19.5), sec(28.4)],
  end: [sec(28.4), ALT.duration],
} as const;

// ------------------------------------------------------------- pieces
const Bolt: React.FC<{ size: number; color?: string; style?: React.CSSProperties }> = ({
  size,
  color = YEL,
  style,
}) => (
  <svg width={size} height={size * 1.5} viewBox="0 0 100 150" style={style}>
    <path d="M60 0 L10 85 H45 L30 150 L90 55 H55 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);

const Battery: React.FC<{ level: number; color: string; w: number }> = ({ level, color, w }) => (
  <svg width={w} height={w * 0.6} viewBox="0 0 200 120">
    <rect x={20} y={4} width={30} height={14} rx={3} fill="#ddd" />
    <rect x={150} y={4} width={30} height={14} rx={3} fill="#ddd" />
    <rect x={6} y={16} width={188} height={100} rx={14} fill={INK} stroke="#ddd" strokeWidth={6} />
    <rect x={18} y={28} width={164 * level} height={76} rx={8} fill={color} />
    <text x={35} y={13} fontSize={16} fill={INK} fontWeight={900}>+</text>
    <text x={160} y={13} fontSize={16} fill={INK} fontWeight={900}>−</text>
  </svg>
);

// Photo with a Ken Burns move between two focus points (image is 1500x2000).
const Photo: React.FC<{
  src: string;
  local: number;
  dur: number;
  from: [number, number, number];
  to: [number, number, number];
  style?: React.CSSProperties;
}> = ({ src, local, dur, from, to, style }) => {
  const p = interpolate(local, [0, dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const fx = from[0] + (to[0] - from[0]) * p;
  const fy = from[1] + (to[1] - from[1]) * p;
  const z = from[2] + (to[2] - from[2]) * p;
  const s = (H / 2000) * z;
  const iw = 1500 * s;
  const ih = 2000 * s;
  const x = Math.min(0, Math.max(W - iw, W / 2 - fx * s));
  const y = Math.min(0, Math.max(H - ih, H / 2 - fy * s));
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <Img src={staticFile(src)} style={{ position: "absolute", left: x, top: y, width: iw, height: ih }} />
    </AbsoluteFill>
  );
};

const Sticker: React.FC<{
  at: number;
  text: string;
  x: number;
  y: number;
  rot: number;
  bg?: string;
  fg?: string;
  size?: number;
}> = ({ at, text, x, y, rot, bg = YEL, fg = INK, size = 84 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = pop(f, at, 9);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        padding: "10px 34px",
        background: bg,
        color: fg,
        fontFamily: CAPS,
        fontSize: size,
        letterSpacing: 2,
        border: `8px solid ${INK}`,
        borderRadius: 18,
        boxShadow: `12px 14px 0 ${INK}`,
        transform: `scale(${p}) rotate(${rot + Math.sin((f - at) / 7) * 2}deg)`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

// ------------------------------------------------------------- scenes
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const blink = Math.floor(f / 8) % 2 === 0;
  const shake = f < 70 ? (random(`s${f}`) - 0.5) * 18 : 0;
  const t2 = wordAt("¡No");
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #2a0505, ${INK} 70%)` }}>
      <div style={{ position: "absolute", left: 240, top: 330, transform: `rotate(${shake / 6}deg)` }}>
        <Battery level={0.12} color={blink ? RED : "#5a0000"} w={600} />
      </div>
      <div style={{ position: "absolute", left: 0, width: W, top: 760, textAlign: "center", transform: `translateX(${shake}px)` }}>
        {["¿TU CARRO", "NO ARRANCA?"].map((t, i) => {
          const p = pop(f, wordAt(i ? "no" : "¿Tu"), 8);
          return (
            <div key={t} style={{ fontFamily: CAPS, fontSize: 170, lineHeight: 1.05, color: "white", transform: `scale(${p})`, textShadow: `8px 8px 0 ${RED}` }}>
              {t}
            </div>
          );
        })}
      </div>
      <Sticker at={t2} text="¡NO TE QUEDES BOTADO!" x={70} y={1180} rot={-4} bg={YEL} size={86} />
    </AbsoluteFill>
  );
};

const Brand: React.FC<{ local: number }> = ({ local }) => {
  const f = useCurrentFrame();
  const charge = interpolate(local, [5, 60], [0.1, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const col = charge < 0.4 ? RED : charge < 0.8 ? "#ff9500" : "#2bd44a";
  const name = pop(f, wordAt("Altoque"), 9);
  const flash = interpolate(local, [0, 4, 12], [1, 0.8, 0], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, #3a3000, ${INK} 70%)` }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 540 - 6,
            top: 560,
            width: 12,
            height: 900,
            transformOrigin: "50% 0%",
            transform: `rotate(${i * 22.5 + local * 0.6}deg)`,
            background: `linear-gradient(${YEL}55, transparent)`,
          }}
        />
      ))}
      <div style={{ position: "absolute", left: 240, top: 300 }}>
        <Battery level={charge} color={col} w={600} />
      </div>
      <Bolt size={150} style={{ position: "absolute", left: 465, top: 330, transform: `scale(${pop(f, SC.brand[0] + 50, 8)})` }} />
      <div style={{ position: "absolute", left: 0, width: W, top: 760, textAlign: "center", transform: `scale(${name})` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 76, color: "white", letterSpacing: 18 }}>BATERÍAS</div>
        <div style={{ fontFamily: CAPS, fontSize: 250, lineHeight: 0.95, color: YEL, textShadow: `10px 10px 0 ${RED}`, letterSpacing: 4 }}>
          ALTOQUE
        </div>
      </div>
      <Sticker at={wordAt("necesitas")} text="¡LA QUE NECESITAS!" x={150} y={1210} rot={3} bg="white" size={76} />
      <AbsoluteFill style={{ background: "white", opacity: flash }} />
    </AbsoluteFill>
  );
};

const MONTAGE = [
  { src: "alt/p1.jpg", a: SC.montage[0], b: wordAt("Rocket"), from: [750, 650, 1.25], to: [750, 1450, 1.15] },
  { src: "alt/p2.jpg", a: wordAt("Rocket"), b: wordAt("Bosch"), from: [700, 1100, 1.3], to: [700, 1450, 1.2] },
  { src: "alt/p3.jpg", a: wordAt("Bosch"), b: wordAt("muchas"), from: [700, 1050, 1.35], to: [700, 620, 1.2] },
  { src: "alt/p4.jpg", a: wordAt("muchas"), b: SC.montage[1], from: [650, 800, 1.1], to: [700, 1450, 1.3] },
] as const;

const BRANDS = [
  { w: "Capsa", x: 120, y: 260, r: -5, bg: RED, fg: "white" },
  { w: "Varta", x: 560, y: 420, r: 4, bg: YEL, fg: INK },
  { w: "Panasonic", x: 140, y: 600, r: -3, bg: "white", fg: "#0050a0" },
  { w: "Rocket", x: 330, y: 300, r: 4, bg: RED, fg: "white" },
  { w: "Bosch", x: 120, y: 260, r: -4, bg: "white", fg: RED },
  { w: "Topower", x: 420, y: 470, r: 5, bg: "#0b2a6b", fg: YEL },
] as const;

const Montage: React.FC = () => {
  const f = useCurrentFrame();
  const cur = MONTAGE.find((m) => f >= m.a && f < m.b) ?? MONTAGE[3];
  const local = f - cur.a;
  const flash = interpolate(local, [0, 5], [0.7, 0], clamp);
  return (
    <AbsoluteFill>
      <Photo
        src={cur.src}
        local={local}
        dur={cur.b - cur.a}
        from={cur.from as unknown as [number, number, number]}
        to={cur.to as unknown as [number, number, number]}
        style={{ transform: `scale(${1 + interpolate(local, [0, 6], [0.08, 0], clamp)})` }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%)" }} />
      {BRANDS.map((b) => {
        const at = wordAt(b.w);
        const m = MONTAGE.find((x) => at >= x.a && at < x.b);
        if (!m || m !== cur) return null;
        return <Sticker key={b.w} at={at} text={b.w.toUpperCase()} x={b.x} y={b.y} rot={b.r} bg={b.bg} fg={b.fg} size={96} />;
      })}
      {cur === MONTAGE[0] && f < wordAt("Capsa") && (
        <Sticker at={wordAt("mejores")} text="LAS MEJORES MARCAS" x={110} y={260} rot={-3} size={80} />
      )}
      {cur === MONTAGE[3] && <Sticker at={cur.a} text="¡Y MUCHAS MÁS!" x={200} y={300} rot={-4} size={100} />}
      <AbsoluteFill style={{ background: "white", opacity: flash }} />
    </AbsoluteFill>
  );
};

const Check: React.FC<{ at: number; text: string; y: number; color: string }> = ({ at, text, y, color }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = pop(f, at, 11);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: y,
        width: 920,
        height: 150,
        borderRadius: 26,
        background: "rgba(11,11,11,0.88)",
        border: `6px solid ${color}`,
        display: "flex",
        alignItems: "center",
        gap: 30,
        padding: "0 34px",
        boxSizing: "border-box",
        transform: `translateX(${(1 - p) * -1100}px)`,
      }}
    >
      <div style={{ width: 92, height: 92, borderRadius: 46, background: color, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(f, at + 6, 8)})`, flexShrink: 0 }}>
        <svg width={56} height={56} viewBox="0 0 24 24">
          <path d="M4 12.5 L10 18 L20 6" stroke={INK} strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ fontFamily: CAPS, fontSize: 70, color: "white", letterSpacing: 1, whiteSpace: "nowrap" }}>{text}</div>
    </div>
  );
};

const Features: React.FC<{ local: number; dur: number }> = ({ local, dur }) => (
  <AbsoluteFill>
    <Photo
      src="alt/p4.jpg"
      local={local}
      dur={dur}
      from={[700, 1100, 1.1]}
      to={[700, 1200, 1.25]}
      style={{ filter: "blur(6px) brightness(0.55)" }}
    />
    <Check at={wordAt("autos")} text="AUTOS" y={230} color={YEL} />
    <Check at={wordAt("camionetas")} text="CAMIONETAS" y={410} color={YEL} />
    <Check at={wordAt("pesados")} text="VEHÍCULOS PESADOS" y={590} color={YEL} />
    <Check at={wordAt("mantenimiento")} text="LIBRES DE MANTENIMIENTO" y={830} color="#2bd44a" />
    <Check at={wordAt("garantía")} text="CON GARANTÍA" y={1010} color="#2bd44a" />
  </AbsoluteFill>
);

const End: React.FC<{ local: number }> = ({ local }) => {
  const f = useCurrentFrame();
  const a = pop(f, SC.end[0], 10);
  const beat = Math.exp(-((local / (60 / 108 * FPS)) % 1) * 6);
  return (
    <AbsoluteFill style={{ background: YEL }}>
      <AbsoluteFill style={{ background: `repeating-linear-gradient(-45deg, ${YEL} 0 60px, #f2c800 60px 120px)`, transform: `translateX(${(local * 3) % 170}px)`, width: W + 200, left: -170 }} />
      <div style={{ position: "absolute", left: 90, top: 230, width: 900, height: 1020, borderRadius: 40, background: INK, boxShadow: `20px 22px 0 ${RED}`, transform: `scale(${a * (1 + 0.02 * beat)}) rotate(${(1 - a) * -8}deg)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Bolt size={170} style={{ transform: `rotate(${Math.sin(local / 8) * 6}deg)` }} />
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 76, color: "white", letterSpacing: 18, marginTop: 20 }}>BATERÍAS</div>
        <div style={{ fontFamily: CAPS, fontSize: 230, lineHeight: 0.95, color: YEL, textShadow: `10px 10px 0 ${RED}` }}>ALTOQUE</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: "white", marginTop: 30, textAlign: "center", lineHeight: 1.25 }}>
          Todas las marcas
          <br />
          <span style={{ color: YEL }}>¡al toque!</span>
        </div>
      </div>
      <Sticker at={wordAt("¡Visítanos")} text="¡VISÍTANOS!" x={230} y={1180} rot={-4} bg={RED} fg="white" size={110} />
    </AbsoluteFill>
  );
};

// Word-by-word captions, the current word in yellow.
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const line = ALT.lines.find((l) => f >= l.words[0].f - 2 && f <= l.words[l.words.length - 1].e + 8);
  if (!line) return null;
  const ws = line.words as readonly Word[];
  const idx = ws.findIndex((w) => f >= w.f && f < w.e + 4);
  const k = Math.max(0, idx < 0 ? ws.filter((w) => w.f <= f).length - 1 : idx);
  const start = Math.floor(k / 3) * 3;
  const group = ws.slice(start, start + 3);
  return (
    <AbsoluteFill style={{ top: 1500, height: 260, flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "0 22px", padding: "0 60px" }}>
      {group.map((w, i) => {
        const on = start + i === k;
        const p = pop(f, w.f, 10);
        return (
          <span
            key={i}
            style={{
              fontFamily: CAPS,
              fontSize: on ? 104 : 90,
              color: on ? YEL : "white",
              WebkitTextStroke: `4px ${INK}`,
              textShadow: `6px 6px 0 ${INK}`,
              textTransform: "uppercase",
              opacity: f >= w.f ? 1 : 0.35,
              transform: `scale(${f >= w.f ? 0.8 + 0.2 * p : 0.9})`,
              display: "inline-block",
            }}
          >
            {w.w}
          </span>
        );
      })}
    </AbsoluteFill>
  );
};

export const Altoque: React.FC = () => {
  const f = useCurrentFrame();
  const scene = (Object.keys(SC) as (keyof typeof SC)[]).find((k) => f >= SC[k][0] && f < SC[k][1]) ?? "end";
  const local = f - SC[scene][0];
  const dur = SC[scene][1] - SC[scene][0];
  const cut = Object.values(SC).some(([a]) => a > 0 && Math.abs(f - a) < 4);
  const speaking = (x: number) => ALT.lines.some((l) => x >= l.words[0].f - 6 && x <= l.words[l.words.length - 1].e + 6);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ transform: cut ? `translateX(${(random(`c${f}`) - 0.5) * 40}px) scale(1.04)` : undefined }}>
        {scene === "hook" && <Hook />}
        {scene === "brand" && <Brand local={local} />}
        {scene === "montage" && <Montage />}
        {scene === "features" && <Features local={local} dur={dur} />}
        {scene === "end" && <End local={local} />}
      </AbsoluteFill>
      <Captions />
      <Audio
        src={staticFile("alt/musica.wav")}
        volume={(x) =>
          (speaking(x) ? 0.25 : 0.55) *
          interpolate(x, [0, 10, ALT.duration - 40, ALT.duration], [0, 1, 1, 0], clamp)
        }
      />
      {ALT.lines.map((l, i) => (
        <Sequence key={i} from={l.from}>
          <Audio src={staticFile(l.src)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
