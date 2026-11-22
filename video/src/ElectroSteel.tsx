import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ES } from "./esData";

// Edited class presentation: rebuilt animated slides synced to the speech,
// clean webcam tiles, silences and slips cut out.
const FPS = 30;
const INTRO = 4 * FPS;
const OUTRO = 6 * FPS;
export const ES_DURATION = INTRO + ES.mainFrames + OUTRO;

const NAVY = "#19274E";
const BLUE = "#0097BE";
const AMBER = "#F59E0B";
const GREEN = "#14A587";
const GREY = "#69778F";
const INK = "#283046";
const LINE = "#DEE7F2";
const FONT = "Inter, sans-serif";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ----------------------------------------------------------- time mapping
type Seg = (typeof ES.segments)[number];
const SEGS: readonly Seg[] = ES.segments;
// Source second -> absolute output frame (times inside a cut snap forward).
const srcToOut = (s: number): number => {
  for (const g of SEGS) {
    if (s < g.src) return INTRO + g.from;
    if (s <= g.srcEnd) return INTRO + g.from + Math.round((s - g.src) * FPS);
  }
  return INTRO + ES.mainFrames;
};
// Absolute output frame -> source second.
const outToSrc = (f: number): number => {
  const m = f - INTRO;
  if (m <= 0) return 0;
  for (const g of SEGS) {
    if (m < g.from + g.dur) return g.src + (m - g.from) / FPS;
  }
  return 9999;
};
const cue = (k: keyof typeof ES.cues) => srcToOut(ES.cues[k]);
const SLIDE_OUT = ES.slides.map((s) => srcToOut(s));
const slideAt = (f: number) => {
  let i = 0;
  SLIDE_OUT.forEach((s, k) => {
    if (f >= s) i = k;
  });
  return i;
};
const speakerAt = (f: number) =>
  (ES.speakers.find((s) => outToSrc(f) < s.until) ?? ES.speakers[2]).name;

const pop = (frame: number, at: number, damping = 14) =>
  spring({ frame: frame - at, fps: FPS, config: { damping } });

// Spanish number formatting with a fixed number of decimals.
const fmt = (v: number, d: number) =>
  v
    .toFixed(d)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const Count: React.FC<{ to: number; at: number; d: number; dur?: number }> = ({
  to,
  at,
  d,
  dur = 30,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return <>{fmt(to * p, d)}</>;
};

// ---------------------------------------------------------- slide pieces
const Reveal: React.FC<{
  at: number;
  from?: "up" | "left" | "right" | "scale";
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, from = "up", children, style }) => {
  const f = useCurrentFrame();
  const p = pop(f, at);
  const t =
    from === "up"
      ? `translateY(${(1 - p) * 40}px)`
      : from === "left"
        ? `translateX(${(1 - p) * -80}px)`
        : from === "right"
          ? `translateX(${(1 - p) * 80}px)`
          : `scale(${0.6 + 0.4 * p})`;
  return (
    <div style={{ position: "absolute", opacity: p, transform: t, ...style }}>
      {children}
    </div>
  );
};

// Highlight ring that pulses once when the speaker mentions something.
const pulse = (f: number, at: number) => {
  if (f < at) return 0;
  const p = pop(f, at, 10);
  return Math.min(1, p) * (0.6 + 0.4 * Math.max(0, Math.sin((f - at) / 6)));
};

const Header: React.FC<{ title: string; tag: string; at: number }> = ({
  title,
  tag,
  at,
}) => {
  const f = useCurrentFrame();
  const n = Math.round(
    interpolate(f, [at + 4, at + 4 + title.length * 0.9], [0, title.length], clamp),
  );
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 53,
          top: 32,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 32,
          color: NAVY,
        }}
      >
        {title.slice(0, n)}
        <span style={{ opacity: n < title.length ? 1 : 0, color: BLUE }}>|</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 55,
          top: 88,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: 1.5,
          color: BLUE,
          opacity: pop(f, at + 10),
        }}
      >
        {tag}
      </div>
      <div
        style={{
          position: "absolute",
          left: 55,
          top: 108,
          height: 3,
          width: 220 * pop(f, at + 12),
          background: AMBER,
          borderRadius: 2,
        }}
      />
    </>
  );
};

const Card: React.FC<{
  w: number;
  h: number;
  accent: string;
  label: string;
  glow?: number;
  children: React.ReactNode;
}> = ({ w, h, accent, label, glow = 0, children }) => (
  <div
    style={{
      width: w,
      height: h,
      background: "white",
      borderRadius: 14,
      boxShadow: `0 8px 24px rgba(25,39,78,0.12), 0 0 0 ${4 * glow}px ${accent}55`,
      display: "flex",
      overflow: "hidden",
      transform: `scale(${1 + 0.04 * glow})`,
    }}
  >
    <div style={{ width: 8, background: accent }} />
    <div style={{ padding: "16px 20px", flex: 1, fontFamily: FONT }}>
      <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, color: NAVY }}>
        {label}
      </div>
      {children}
    </div>
  </div>
);

const Big: React.FC<{ color: string; size?: number; children: React.ReactNode }> = ({
  color,
  size = 34,
  children,
}) => (
  <div style={{ fontWeight: 800, fontSize: size, color, marginTop: 8 }}>{children}</div>
);
const Small: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 15, color: GREY, marginTop: 6, lineHeight: 1.35 }}>
    {children}
  </div>
);
const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 17, color: INK, marginTop: 14, lineHeight: 1.4 }}>
    {children}
  </div>
);

const Footer: React.FC<{ n: number }> = ({ n }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: 53,
        top: 682,
        fontFamily: FONT,
        fontSize: 11,
        fontWeight: 700,
        color: GREY,
        letterSpacing: 1,
      }}
    >
      ELECTROSTEEL S.A. | ESTADÍSTICA PARA INGENIERÍA
    </div>
    <div
      style={{
        position: "absolute",
        right: 55,
        top: 680,
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: 700,
        color: GREY,
      }}
    >
      {String(n).padStart(2, "0")} / 11
    </div>
  </>
);

// --------------------------------------------------------------- slides
// Each slide is drawn on a 1280x720 canvas; `s` is its start frame.
const Cover: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const z = interpolate(f - s, [0, 1200], [1.0, 1.08], clamp);
  const sweep = ((f - s) % 150) / 150;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: NAVY }}>
      <Img
        src={staticFile("es/portada_bg.png")}
        style={{ width: 1280, height: 720, objectFit: "cover", transform: `scale(${z})` }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(105deg, transparent ${sweep * 140 - 30}%, rgba(255,255,255,0.18) ${sweep * 140 - 20}%, transparent ${sweep * 140 - 10}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const S2: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const q = "¿Cuánta energía debe asegurar ElectroSteel para el primer trimestre del año 8?";
  const qa = cue("s2q");
  const n = Math.round(interpolate(f, [qa, qa + 70], [0, q.length], clamp));
  return (
    <>
      <Header title="¿Qué necesita saber la gerencia?" tag="PROBLEMA Y OBJETIVO" at={s} />
      <Reveal at={cue("s2info")} style={{ left: 55, top: 140 }}>
        <Card w={370} h={190} accent={BLUE} label="INFORMACIÓN DISPONIBLE">
          <Big color={BLUE} size={44}>
            <Count to={84} at={cue("s2info")} d={0} /> meses
          </Big>
          <Small>7 años de registros · Unidad: MWh</Small>
        </Card>
      </Reveal>
      <Reveal at={cue("s2need")} style={{ left: 455, top: 140 }}>
        <Card w={370} h={190} accent={AMBER} label="NECESIDAD">
          <Body>
            Conocer la evolución del consumo e identificar los meses de mayor y menor
            demanda.
          </Body>
        </Card>
      </Reveal>
      <Reveal at={cue("s2obj")} style={{ left: 855, top: 140 }}>
        <Card w={370} h={190} accent={GREEN} label="OBJETIVO">
          <Body>
            Proyectar enero, febrero y marzo del año 8 para apoyar el suministro y
            presupuesto.
          </Body>
        </Card>
      </Reveal>
      <Reveal at={qa - 6} from="scale" style={{ left: 55, top: 380 }}>
        <div
          style={{
            width: 1170,
            padding: "26px 34px",
            boxSizing: "border-box",
            borderRadius: 16,
            background: NAVY,
            fontFamily: FONT,
          }}
        >
          <div style={{ color: AMBER, fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>
            PREGUNTA CENTRAL
          </div>
          <div
            style={{
              color: "white",
              fontWeight: 800,
              fontSize: 32,
              marginTop: 10,
              lineHeight: 1.25,
              minHeight: 80,
            }}
          >
            {q.slice(0, n)}
          </div>
        </div>
      </Reveal>
      <Reveal at={qa + 60} style={{ left: 55, top: 600 }}>
        <div style={{ fontFamily: FONT, fontSize: 14, color: GREY }}>
          Base del análisis: consumo mensual de la planta durante siete años (84
          observaciones).
        </div>
      </Reveal>
      <Footer n={2} />
    </>
  );
};

// Box plot geometry taken from the deck (EMU/1000 units on a 12192 x 6858 slide).
const BOX = [
  ["Ene", 3898, 1064, 4324, 4489],
  ["Feb", 4134, 1123, 4561, 4725],
  ["Mar", 3720, 1064, 4147, 4311],
  ["Abr", 3425, 1241, 3910, 4075],
  ["May", 2952, 1359, 3496, 3661],
  ["Jun", 2538, 1359, 3083, 3247],
  ["Jul", 1947, 1537, 2610, 2774],
  ["Ago", 2065, 1478, 2728, 2892],
  ["Set", 2833, 1359, 3319, 3484],
  ["Oct", 3247, 1300, 3674, 3838],
  ["Nov", 3484, 1300, 3969, 4134],
  ["Dic", 3070, 1359, 3615, 3779],
] as const;
const S3: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const hi = pulse(f, cue("s3hi"));
  const lo = pulse(f, cue("s3lo"));
  return (
    <>
      <Header title="Análisis exploratorio del consumo" tag="COMPORTAMIENTO MENSUAL" at={s} />
      <svg
        viewBox="0 0 12192 6858"
        width={1280}
        height={720}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {[450, 500, 550, 600, 650, 700].map((v, k) => {
          const y = 5026 - (v - 450) * 11.82;
          return (
            <g key={v} opacity={pop(f, s + 5 + k * 2)}>
              <rect x={777} y={y - 5} width={7315 * pop(f, s + 5 + k * 2)} height={10} fill={LINE} />
              <text x={680} y={y + 60} fontSize={150} fill={GREY} textAnchor="end" fontFamily={FONT}>
                {v}
              </text>
            </g>
          );
        })}
        <text x={330} y={1720} fontSize={140} fill={GREY} fontFamily={FONT}>
          MWh
        </text>
        {BOX.map(([m, wy, wh, by, my], i) => {
          const cx = 1126 + i * 619.2;
          const p = pop(f, s + 20 + i * 4, 13);
          const isHi = m === "Jul" || m === "Ago";
          const isLo = m === "Ene" || m === "Feb";
          const g = isHi ? hi : isLo ? lo : 0;
          const col = isHi ? AMBER : isLo ? BLUE : "#B1E0EF";
          const mid = my + 11;
          return (
            <g key={m}>
              <rect
                x={cx - 11}
                y={mid - (mid - wy) * p}
                width={22}
                height={wh * p}
                fill={NAVY}
              />
              <rect
                x={cx - 114}
                y={mid - (mid - by) * p}
                width={228}
                height={329 * p}
                fill={g > 0 ? col : "#B1E0EF"}
                stroke={g > 0 ? col : "none"}
                strokeWidth={60 * g}
                opacity={0.9}
              />
              <rect x={cx - 114} y={my} width={228} height={22} fill={AMBER} opacity={p} />
              <text
                x={cx}
                y={5480}
                fontSize={150}
                fill={g > 0 ? col : INK}
                fontWeight={g > 0 ? 800 : 400}
                textAnchor="middle"
                fontFamily={FONT}
                opacity={pop(f, s + 20 + i * 4)}
              >
                {m}
              </text>
            </g>
          );
        })}
      </svg>
      <Reveal at={cue("s3hi")} from="right" style={{ left: 885, top: 160 }}>
        <Card w={320} h={135} accent={AMBER} label="MAYOR CONSUMO" glow={hi}>
          <Big color={AMBER}>JUL · AGO</Big>
          <Small>Julio y agosto</Small>
        </Card>
      </Reveal>
      <Reveal at={cue("s3lo")} from="right" style={{ left: 885, top: 325 }}>
        <Card w={320} h={135} accent={BLUE} label="MENOR CONSUMO" glow={lo}>
          <Big color={BLUE}>ENE · FEB</Big>
          <Small>Enero y febrero</Small>
        </Card>
      </Reveal>
      <Reveal at={s + 80} style={{ left: 80, top: 612 }}>
        <div style={{ fontFamily: FONT, fontSize: 13, color: GREY }}>
          La caja representa el 50 % central; la línea interior señala la mediana.
          Gráfico esquemático basado en la figura del informe.
        </div>
      </Reveal>
      <Footer n={3} />
    </>
  );
};

const S4: React.FC<{ s: number }> = ({ s }) => {
  const cards = [
    { k: "s4c1", l: "01  TENDENCIA", c: BLUE, t: "Crecimiento aproximado de 1,55 MWh por mes." },
    { k: "s4c2", l: "02  ESTACIONALIDAD", c: AMBER, t: "Mínimo en febrero; máximo en julio." },
    { k: "s4c3", l: "03  CICLO", c: GREEN, t: "No se identifica un ciclo plurianual claro en los 7 años." },
    { k: "s4c4", l: "04  ALEATORIEDAD", c: NAVY, t: "Desviaciones pequeñas respecto al patrón observado." },
  ] as const;
  const f = useCurrentFrame();
  return (
    <>
      <Header title="Una serie, cuatro componentes" tag="LECTURA DE LA SERIE TEMPORAL" at={s} />
      {cards.map((c, i) => {
        const at = cue(c.k);
        return (
          <Reveal
            key={c.k}
            at={at}
            from={i % 2 ? "right" : "left"}
            style={{ left: 80 + (i % 2) * 565, top: 150 + Math.floor(i / 2) * 200 }}
          >
            <Card w={520} h={160} accent={c.c} label={c.l} glow={pulse(f, at) * (f < at + 90 ? 1 : 0)}>
              <Body>{c.t}</Body>
            </Card>
          </Reveal>
        );
      })}
      <Reveal at={cue("s4foot")} from="scale" style={{ left: 0, width: 1280, top: 580 }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 22,
            color: NAVY,
            textAlign: "center",
          }}
        >
          El patrón anual se repite: el consumo no es igual en todos los meses.
        </div>
      </Reveal>
      <Footer n={4} />
    </>
  );
};

const S5: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const eq = ["Y", "=", "T", "×", "S", "×", "I"];
  const steps = [
    ["s5st1", "Media móvil centrada", "12 meses"],
    ["s5st2", "Razón", "Consumo / media móvil"],
    ["s5st3", "Índices mensuales", "Promedio de razones por mes"],
    ["s5st4", "Normalización", "Los 12 índices suman 12"],
    ["s5st5", "Tendencia y pronóstico", "Desestacionalizar y ajustar mínimos cuadrados"],
  ] as const;
  const lineP = interpolate(f, [cue("s5st1"), cue("s5st5")], [0, 1], clamp);
  return (
    <>
      <Header title="Método: descomposición multiplicativa" tag="MODELAMIENTO" at={s} />
      <div style={{ position: "absolute", left: 60, top: 140, display: "flex", gap: 14 }}>
        {eq.map((c, i) => {
          const p = pop(f, cue("s5eq") + i * 5, 9);
          return (
            <div
              key={i}
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 58,
                color: i % 2 ? GREY : [NAVY, BLUE, AMBER, GREEN][i / 2],
                transform: `scale(${p}) translateY(${(1 - p) * -40}px)`,
                opacity: p,
              }}
            >
              {c}
            </div>
          );
        })}
      </div>
      <Reveal at={cue("s5eq") + 40} style={{ left: 520, top: 150, width: 680 }}>
        <div style={{ fontFamily: FONT, fontSize: 19, color: INK, lineHeight: 1.4 }}>
          Se utiliza porque el patrón estacional se mantiene proporcional al nivel de la
          serie.
        </div>
      </Reveal>
      <div
        style={{
          position: "absolute",
          left: 125,
          top: 383,
          height: 4,
          width: 1000 * lineP,
          background: `linear-gradient(90deg, ${BLUE}, ${AMBER})`,
          borderRadius: 2,
        }}
      />
      {steps.map(([k, t, d], i) => {
        const at = cue(k);
        const p = pop(f, at, 10);
        const x = 125 + i * 250;
        return (
          <div key={k}>
            <div
              style={{
                position: "absolute",
                left: x - 34,
                top: 351,
                width: 68,
                height: 68,
                borderRadius: 34,
                background: i === 4 ? AMBER : BLUE,
                color: "white",
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${p})`,
                boxShadow: `0 0 0 ${10 * pulse(f, at) * (f < at + 60 ? 1 : 0)}px ${BLUE}33`,
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                position: "absolute",
                left: x - 110,
                width: 220,
                top: 440,
                textAlign: "center",
                fontFamily: FONT,
                opacity: p,
                transform: `translateY(${(1 - p) * 20}px)`,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 17, color: NAVY }}>{t}</div>
              <div style={{ fontSize: 14, color: GREY, marginTop: 8 }}>{d}</div>
            </div>
          </div>
        );
      })}
      <Reveal at={cue("s5foot")} style={{ left: 0, width: 1280, top: 590 }}>
        <div style={{ fontFamily: FONT, fontSize: 18, color: INK, textAlign: "center" }}>
          La serie se desestacionaliza dividiendo <b>Y</b> entre <b>S</b>; luego se ajusta
          una recta por mínimos cuadrados.
        </div>
      </Reveal>
      <Footer n={5} />
    </>
  );
};

const IDX = [0.9083, 0.8705, 0.9261, 0.9637, 1.0235, 1.0813, 1.1592, 1.136, 1.0332, 0.9746, 0.9352, 0.9884];
const MES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
const S6: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const X0 = 90;
  const Y0 = 560;
  const H = 380; // 0.7 .. 1.2
  const y = (v: number) => Y0 - ((v - 0.7) / 0.5) * H;
  const marks: Record<number, number> = { 1: cue("s6feb"), 6: cue("s6jul"), 7: cue("s6ago") };
  const cards = [
    { k: "s6feb", l: "FEBRERO · 0,8705", c: BLUE, v: -12.95, t: "por debajo de la tendencia." },
    { k: "s6jul", l: "JULIO · 1,1592", c: AMBER, v: 15.92, t: "por encima de la tendencia." },
    { k: "s6ago", l: "AGOSTO · 1,1360", c: AMBER, v: 13.6, t: "por encima de la tendencia." },
  ] as const;
  return (
    <>
      <Header title="Índices estacionales: ¿qué meses se apartan de la tendencia?" tag="RESULTADOS" at={s} />
      <svg width={1280} height={720} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0.7, 0.8, 0.9, 1.0, 1.1, 1.2].map((v) => (
          <g key={v}>
            <line x1={X0} x2={X0 + 700} y1={y(v)} y2={y(v)} stroke={v === 1 ? GREY : LINE} strokeWidth={v === 1 ? 2 : 1} strokeDasharray={v === 1 ? "8 6" : undefined} />
            <text x={X0 - 12} y={y(v) + 5} fontSize={14} fill={GREY} textAnchor="end" fontFamily={FONT}>
              {fmt(v, 1)}
            </text>
          </g>
        ))}
        {IDX.map((v, i) => {
          const p = pop(f, s + 20 + i * 4, 15);
          const at = marks[i];
          const g = at ? pulse(f, at) : 0;
          const hiCol = i === 1 || i === 6 || i === 7;
          const col = hiCol ? AMBER : BLUE;
          const bx = X0 + 15 + i * 57;
          const top = y(0.7 + (v - 0.7) * p);
          return (
            <g key={i}>
              <rect x={bx - 4 * g} y={top} width={40 + 8 * g} height={Y0 - top} fill={col} rx={4} opacity={g > 0 || !at ? 1 : 0.95} />
              {g > 0 && (
                <text x={bx + 20} y={top - 12} fontSize={18} fontWeight={800} fill={col} textAnchor="middle" fontFamily={FONT} opacity={g}>
                  {fmt(v, 4)}
                </text>
              )}
              <text x={bx + 20} y={Y0 + 24} fontSize={14} fill={INK} textAnchor="middle" fontFamily={FONT}>
                {MES[i]}
              </text>
            </g>
          );
        })}
      </svg>
      {cards.map((c, i) => {
        const at = cue(c.k);
        return (
          <Reveal key={c.k} at={at} from="right" style={{ left: 900, top: 140 + i * 150 }}>
            <Card w={320} h={130} accent={c.c} label={c.l} glow={pulse(f, at) * (f < at + 120 ? 1 : 0.3)}>
              <Big color={c.c}>
                {c.v > 0 ? "+" : "−"}
                <Count to={Math.abs(c.v)} at={at} d={2} /> %
              </Big>
              <Small>{c.t}</Small>
            </Card>
          </Reveal>
        );
      })}
      <Reveal at={s + 90} style={{ left: 90, top: 610 }}>
        <div style={{ fontFamily: FONT, fontSize: 14, color: GREY }}>
          Índice = 1: nivel de tendencia. Mayor que 1: por encima. Menor que 1: por debajo.
        </div>
      </Reveal>
      <Footer n={6} />
    </>
  );
};

const S7: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const X0 = 110;
  const X1 = 800;
  const Y0 = 560;
  const Y1 = 200;
  const x = (t: number) => X0 + (t / 84) * (X1 - X0);
  const y = (v: number) => Y0 - ((v - 480) / 150) * (Y0 - Y1);
  const draw = interpolate(f, [s + 25, cue("s7pend") + 40], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const tNow = 1 + 83 * draw;
  const T = (t: number) => 488.44 + 1.5483 * t;
  const eq = "T(t) = 488,44 + 1,5483 · t";
  const n = Math.round(interpolate(f, [cue("s7eq"), cue("s7eq") + 45], [0, eq.length], clamp));
  return (
    <>
      <Header title="Modelo de tendencia lineal" tag="AJUSTE POR MÍNIMOS CUADRADOS" at={s} />
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 132,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 36,
          color: NAVY,
        }}
      >
        {eq.slice(0, n)}
      </div>
      <svg width={1280} height={720} style={{ position: "absolute", left: 0, top: 0 }}>
        {[480, 510, 540, 570, 600, 630].map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={y(v)} y2={y(v)} stroke={LINE} />
            <text x={X0 - 10} y={y(v) + 5} fontSize={13} fill={GREY} textAnchor="end" fontFamily={FONT}>
              {v}
            </text>
          </g>
        ))}
        {[0, 12, 24, 36, 48, 60, 72, 84].map((t) => (
          <text key={t} x={x(t)} y={Y0 + 22} fontSize={13} fill={GREY} textAnchor="middle" fontFamily={FONT}>
            {t}
          </text>
        ))}
        <text x={(X0 + X1) / 2} y={Y0 + 46} fontSize={13} fill={GREY} textAnchor="middle" fontFamily={FONT}>
          t (mes)
        </text>
        <line x1={x(1)} y1={y(T(1))} x2={x(tNow)} y2={y(T(tNow))} stroke={AMBER} strokeWidth={5} strokeLinecap="round" />
        {draw > 0 && (
          <g>
            <circle cx={x(tNow)} cy={y(T(tNow))} r={9} fill={AMBER} stroke="white" strokeWidth={3} />
            <rect x={x(tNow) - 52} y={y(T(tNow)) - 44} width={104} height={28} rx={8} fill={NAVY} opacity={draw < 1 ? 1 : 0.85} />
            <text x={x(tNow)} y={y(T(tNow)) - 24} fontSize={15} fontWeight={700} fill="white" textAnchor="middle" fontFamily={FONT}>
              {fmt(T(tNow), 1)} MWh
            </text>
          </g>
        )}
      </svg>
      <Reveal at={cue("s7r2")} from="scale" style={{ left: 880, top: 132 }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: BLUE }}>
          R² = <Count to={0.998} at={cue("s7r2")} d={3} dur={40} />
        </div>
      </Reveal>
      <Reveal at={cue("s7pend")} from="right" style={{ left: 880, top: 220 }}>
        <Card w={320} h={135} accent={BLUE} label="PENDIENTE" glow={pulse(f, cue("s7pend")) * (f < cue("s7pend") + 100 ? 1 : 0)}>
          <Big color={BLUE}>
            +<Count to={1.55} at={cue("s7pend")} d={2} />
          </Big>
          <Small>La demanda base aumenta 1,55 MWh por mes.</Small>
        </Card>
      </Reveal>
      <Reveal at={cue("s7int")} from="right" style={{ left: 880, top: 385 }}>
        <Card w={320} h={140} accent={GREEN} label="INTERPRETACIÓN">
          <Body>R² = 0,998: ajuste muy alto en la serie desestacionalizada.</Body>
        </Card>
      </Reveal>
      <Reveal at={s + 60} style={{ left: 110, top: 625 }}>
        <div style={{ fontFamily: FONT, fontSize: 14, color: GREY }}>
          El modelo se ajustó sobre el consumo desestacionalizado (Y / S).
        </div>
      </Reveal>
      <Footer n={7} />
    </>
  );
};

const S8: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const months = [
    { k: "s8ene", l: "ENERO", v: 563.18, c: BLUE, t: 85, i: "0,9083" },
    { k: "s8feb", l: "FEBRERO", v: 541.1, c: AMBER, t: 86, i: "0,8705" },
    { k: "s8mar", l: "MARZO", v: 577.11, c: GREEN, t: 87, i: "0,9261" },
  ] as const;
  const tot = cue("s8tot");
  return (
    <>
      <Header title="Pronóstico del primer trimestre del año 8" tag="RESULTADOS DE LA PROYECCIÓN" at={s} />
      {months.map((m, i) => {
        const at = cue(m.k);
        return (
          <Reveal key={m.k} at={at} from="up" style={{ left: 55 + i * 395, top: 140 }}>
            <Card w={370} h={200} accent={m.c} label={m.l} glow={pulse(f, at) * (f < at + 90 ? 1 : 0)}>
              <Big color={m.c} size={40}>
                <Count to={m.v} at={at} d={2} /> MWh
              </Big>
              <Small>
                t = {m.t}
                <br />
                Índice estacional: {m.i}
              </Small>
            </Card>
          </Reveal>
        );
      })}
      <Reveal at={cue("s8form")} style={{ left: 55, top: 385 }}>
        <div style={{ fontFamily: FONT }}>
          <div style={{ fontWeight: 800, fontSize: 24, color: NAVY }}>
            Pronóstico = T(t) × S del mes
          </div>
          <div style={{ fontSize: 17, color: INK, marginTop: 10 }}>
            Ejemplo de enero: 620,05 × 0,9083 = 563,18 MWh
          </div>
        </div>
      </Reveal>
      <Reveal at={tot} from="scale" style={{ left: 55, top: 500 }}>
        <div
          style={{
            width: 1170,
            height: 80,
            borderRadius: 14,
            background: NAVY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
            fontFamily: FONT,
            color: "white",
            fontWeight: 800,
            fontSize: 28,
            boxShadow: `0 0 0 ${6 * pulse(f, tot) * (f < tot + 60 ? 1 : 0)}px ${AMBER}66`,
          }}
        >
          <span>
            TOTAL TRIMESTRE: <Count to={1681.4} at={tot} d={1} dur={45} /> MWh
          </span>
          <span style={{ color: AMBER, opacity: pop(f, cue("s8inc")) }}>
            +3,2 % frente al año 7
          </span>
        </div>
      </Reveal>
      <Footer n={8} />
    </>
  );
};

const S9: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const m = [
    { l: "MAE", v: 1.26, u: " MWh", c: BLUE, t: "Error absoluto medio", at: s + 15, hi: 0 },
    { l: "MAPE", v: 0.23, u: " %", c: AMBER, t: "Error porcentual medio", at: s + 25, hi: cue("s9mape") },
    { l: "RMSE", v: 1.6, u: " MWh", c: BLUE, t: "Raíz del error cuadrático medio", at: s + 35, hi: cue("s9rmse") },
  ];
  return (
    <>
      <Header title="¿Qué tan preciso es el modelo?" tag="EVALUACIÓN DEL AJUSTE" at={s} />
      {m.map((x, i) => (
        <Reveal key={x.l} at={x.at} style={{ left: 55 + i * 395, top: 150 }}>
          <Card w={370} h={180} accent={x.c} label={x.l} glow={x.hi ? pulse(f, x.hi) * (f < x.hi + 100 ? 1 : 0) : 0}>
            <Big color={x.c} size={42}>
              <Count to={x.v} at={x.at} d={2} />
              {x.u}
            </Big>
            <Small>{x.t}</Small>
          </Card>
        </Reveal>
      ))}
      <Reveal at={cue("s9int")} style={{ left: 55, top: 385, width: 1000 }}>
        <div style={{ fontFamily: FONT }}>
          <div style={{ color: BLUE, fontWeight: 700, fontSize: 16 }}>Interpretación</div>
          <div style={{ color: NAVY, fontWeight: 800, fontSize: 24, marginTop: 8, lineHeight: 1.3 }}>
            Los errores calculados sobre los 84 meses son bajos y muestran un ajuste
            histórico muy bueno.
          </div>
        </div>
      </Reveal>
      <Reveal at={cue("s9int") + 45} from="scale" style={{ left: 55, top: 545 }}>
        <div
          style={{
            width: 900,
            padding: "14px 20px",
            borderRadius: 10,
            background: "#EEF6FA",
            border: `2px solid ${LINE}`,
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 700,
            color: NAVY,
          }}
        >
          Precaución: el error dentro de la muestra no garantiza la misma precisión en el
          futuro.
        </div>
      </Reveal>
      <Footer n={9} />
    </>
  );
};

const S10: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const rows = [
    ["s10d1", BLUE, "Suministro del trimestre", "Base de 1 681 MWh; considerar margen de 3 a 5 %."],
    ["s10d2", GREEN, "Mantenimiento", "Programar mantenimiento mayor en febrero, mes de menor demanda."],
    ["s10d3", AMBER, "Capacidad en temporada alta", "Evaluar la capacidad para julio: pico proyectado ≈ 729,5 MWh."],
    ["s10d4", NAVY, "Seguimiento mensual", "Comparar consumo real con pronóstico y recalibrar si cambia el patrón."],
  ] as const;
  return (
    <>
      <Header title="Decisiones para la gerencia" tag="APLICACIÓN EMPRESARIAL" at={s} />
      {rows.map(([k, c, t, d], i) => {
        const at = cue(k);
        const p = pop(f, at, 11);
        const active = f >= at && (i === 3 || f < cue(rows[i + 1]?.[0] ?? k));
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 55,
              top: 140 + i * 125,
              width: 1170,
              height: 100,
              borderRadius: 14,
              background: active ? "white" : "transparent",
              boxShadow: active ? "0 8px 24px rgba(25,39,78,0.12)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "0 24px",
              boxSizing: "border-box",
              opacity: p,
              transform: `translateX(${(1 - p) * -60}px)`,
              fontFamily: FONT,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                background: c,
                color: "white",
                fontWeight: 800,
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${p}) rotate(${(1 - p) * -180}deg)`,
                flexShrink: 0,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ width: 300, fontWeight: 800, fontSize: 20, color: NAVY }}>{t}</div>
            <div style={{ flex: 1, fontSize: 18, color: INK }}>{d}</div>
          </div>
        );
      })}
      <Footer n={10} />
    </>
  );
};

const S11: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const c = [
    ["s11c1", "1. La demanda presenta una tendencia creciente de aproximadamente 1,55 MWh por mes."],
    ["s11c2", "2. Existe un patrón estacional definido: febrero registra el menor índice y julio el mayor."],
    ["s11c3", "3. El modelo permite proyectar el consumo y apoyar la planificación del suministro, presupuesto y mantenimiento."],
  ] as const;
  const g = cue("s11g");
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${NAVY}, #0f1838)` }}>
      <div
        style={{
          position: "absolute",
          top: 50,
          width: 1280,
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 38,
          color: "white",
          letterSpacing: 3,
          opacity: pop(f, s),
        }}
      >
        CONCLUSIONES
      </div>
      {c.map(([k, t], i) => (
        <Reveal key={k} at={cue(k)} from={i % 2 ? "right" : "left"} style={{ left: 140, top: 140 + i * 125 }}>
          <div
            style={{
              width: 1000,
              padding: "20px 28px",
              boxSizing: "border-box",
              borderRadius: 14,
              background: "rgba(0,151,190,0.18)",
              border: `2px solid ${BLUE}`,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 21,
              color: "white",
              lineHeight: 1.35,
            }}
          >
            {t}
          </div>
        </Reveal>
      ))}
      <div
        style={{
          position: "absolute",
          top: 545,
          width: 1280,
          textAlign: "center",
          fontFamily: FONT,
          opacity: pop(f, g),
          transform: `scale(${0.8 + 0.2 * pop(f, g, 9)})`,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 40, color: AMBER, letterSpacing: 2 }}>
          MUCHAS GRACIAS
        </div>
        <div style={{ fontSize: 17, color: "#cfd8ea", marginTop: 12 }}>
          Diego Gamarra Cabello · Jeyson Rojas Ore · Liz Escobar Villalba
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SLIDES = [Cover, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11];

// Slide stage: the current slide enters with a short push transition.
const Stage: React.FC = () => {
  const f = useCurrentFrame();
  const i = slideAt(f);
  const s = SLIDE_OUT[i];
  const Comp = SLIDES[i];
  const p = interpolate(f, [s, s + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const prev = i > 0 && p < 1 ? SLIDES[i - 1] : null;
  return (
    <AbsoluteFill style={{ background: "#F6F9FC" }}>
      {prev &&
        React.createElement(
          "div",
          {
            style: {
              position: "absolute",
              inset: 0,
              transform: `translateX(${-p * 300}px)`,
              opacity: 1 - p,
            },
          },
          React.createElement(prev, { s: SLIDE_OUT[i - 1] }),
        )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${(1 - p) * 300}px)`,
          opacity: p,
          background: "#F6F9FC",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 10, background: BLUE }} />
        <Comp s={s} />
        <div style={{ position: "absolute", left: 0, bottom: 0, width: 1280, height: 6, background: BLUE }} />
        <div style={{ position: "absolute", right: 0, bottom: 0, width: 160, height: 6, background: AMBER }} />
      </div>
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------- framing
const NAMES = {
  diego: "Diego Gamarra Cabello",
  jeyson: "Jeyson Rojas Ore",
  liz: "Liz Escobar Villalba",
} as const;
const SECTIONS = [
  "Portada",
  "Problema",
  "Exploratorio",
  "Componentes",
  "Método",
  "Índices",
  "Tendencia",
  "Pronóstico",
  "Precisión",
  "Decisiones",
  "Conclusiones",
];

const Cam: React.FC<{
  who: keyof typeof NAMES;
  x: number;
  y: number;
  w: number;
  h: number;
}> = ({ who, x, y, w, h }) => {
  const f = useCurrentFrame();
  const active = speakerAt(f) === who;
  const bars = [0, 1, 2, 3];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: active
          ? `0 0 0 5px ${AMBER}, 0 0 40px ${AMBER}88`
          : "0 0 0 2px rgba(255,255,255,0.15)",
        background: "#000",
      }}
    >
      {SEGS.map((g, k) => (
        <Sequence key={k} from={INTRO + g.from} durationInFrames={g.dur} layout="none">
          <OffthreadVideo
            src={staticFile(`es/${who}.mp4`)}
            startFrom={Math.round(g.src * FPS)}
            muted
            style={{ width: w, height: h, objectFit: "cover" }}
          />
        </Sequence>
      ))}
      <div
        style={{
          position: "absolute",
          left: 10,
          bottom: 10,
          right: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            padding: "6px 12px",
            borderRadius: 10,
            background: active ? AMBER : "rgba(15,24,56,0.75)",
            color: active ? NAVY : "white",
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: w < 260 ? 14 : 17,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {active && (
            <span style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 16 }}>
              {bars.map((b) => (
                <span
                  key={b}
                  style={{
                    width: 4,
                    height: 5 + Math.abs(Math.sin(f / (3 + b) + b)) * 11,
                    background: NAVY,
                    borderRadius: 2,
                  }}
                />
              ))}
            </span>
          )}
          {w < 260 ? NAMES[who].split(" ")[0] : NAMES[who]}
        </div>
      </div>
    </div>
  );
};

const Background: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 30% 20%, #23386b 0%, ${NAVY} 45%, #0b1430 100%)` }}>
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.18 }}>
        {Array.from({ length: 14 }).map((_, i) => {
          const off = (f * (1 + (i % 3)) + i * 140) % 2400;
          return (
            <line
              key={i}
              x1={off - 400}
              y1={0}
              x2={off - 1000}
              y2={1080}
              stroke={i % 4 === 0 ? AMBER : BLUE}
              strokeWidth={i % 4 === 0 ? 3 : 1.5}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const TopBar: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 30,
      right: 30,
      top: 24,
      height: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: FONT,
      color: "white",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 8, height: 38, background: AMBER, borderRadius: 4 }} />
      <div>
        <div style={{ fontWeight: 800, fontSize: 24 }}>
          Proyección de la demanda de energía eléctrica
        </div>
        <div style={{ fontSize: 15, color: "#b9c6e4" }}>
          Universidad Continental · Estadística para Ingeniería
        </div>
      </div>
    </div>
    <div
      style={{
        padding: "10px 22px",
        borderRadius: 30,
        border: `2px solid ${BLUE}`,
        fontWeight: 700,
        fontSize: 18,
      }}
    >
      Caso: <span style={{ color: AMBER }}>ElectroSteel S.A.</span>
    </div>
  </div>
);

// Section indicator and current speaker under the webcams.
const NowPanel: React.FC = () => {
  const f = useCurrentFrame();
  const i = slideAt(f);
  const who = speakerAt(f);
  const p = pop(f, SLIDE_OUT[i], 12);
  return (
    <div
      style={{
        position: "absolute",
        left: 1424,
        top: 668,
        width: 466,
        height: 198,
        borderRadius: 18,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        padding: "20px 24px",
        boxSizing: "border-box",
        fontFamily: FONT,
        color: "white",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 56, color: AMBER, transform: `scale(${0.7 + 0.3 * p})` }}>
          {String(i + 1).padStart(2, "0")}
        </div>
        <div style={{ fontSize: 20, color: "#b9c6e4" }}>/ 11</div>
        <div style={{ fontWeight: 800, fontSize: 26, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
          {SECTIONS[i]}
        </div>
      </div>
      <div style={{ marginTop: 18, fontSize: 15, color: "#b9c6e4", letterSpacing: 1 }}>EXPONE</div>
      <div style={{ fontWeight: 700, fontSize: 24, marginTop: 4 }}>{NAMES[who]}</div>
    </div>
  );
};

// Chapter timeline along the bottom.
const Timeline: React.FC = () => {
  const f = useCurrentFrame();
  const i = slideAt(f);
  const end = INTRO + ES.mainFrames;
  return (
    <div
      style={{
        position: "absolute",
        left: 30,
        right: 30,
        top: 900,
        height: 150,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      {SECTIONS.map((name, k) => {
        const a = SLIDE_OUT[k];
        const b = k < 10 ? SLIDE_OUT[k + 1] : end;
        const prog = interpolate(f, [a, b], [0, 1], clamp);
        const cur = k === i;
        return (
          <div key={name} style={{ flex: cur ? 1.6 : 1, transition: "none" }}>
            <div
              style={{
                height: cur ? 14 : 8,
                borderRadius: 7,
                background: "rgba(255,255,255,0.15)",
                overflow: "hidden",
              }}
            >
              <div style={{ width: `${prog * 100}%`, height: "100%", background: cur ? AMBER : BLUE }} />
            </div>
            <div
              style={{
                marginTop: 12,
                fontFamily: FONT,
                fontWeight: cur ? 800 : 600,
                fontSize: cur ? 20 : 15,
                color: cur ? "white" : k < i ? "#8fd3e8" : "#7f8db0",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------- intro/outro
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [INTRO - 12, INTRO], [1, 0], clamp);
  const line = interpolate(f, [5, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Img
        src={staticFile("es/portada_bg.png")}
        style={{
          position: "absolute",
          width: 1920,
          height: 1080,
          objectFit: "cover",
          filter: "blur(14px) brightness(0.45)",
          transform: `scale(${1.1 + f / 2000})`,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, color: "white" }}>
        <div style={{ fontSize: 30, letterSpacing: 6, color: "#b9c6e4", opacity: pop(f, 0) }}>
          ESTADÍSTICA PARA INGENIERÍA
        </div>
        <div style={{ fontWeight: 800, fontSize: 92, marginTop: 20, textAlign: "center", lineHeight: 1.05, opacity: pop(f, 8), transform: `translateY(${(1 - pop(f, 8)) * 40}px)` }}>
          Proyección de la demanda
          <br />
          de <span style={{ color: AMBER }}>energía eléctrica</span>
        </div>
        <div style={{ width: 600 * line, height: 6, background: `linear-gradient(90deg, ${BLUE}, ${AMBER})`, borderRadius: 3, marginTop: 30 }} />
        <div style={{ fontSize: 36, fontWeight: 700, marginTop: 30, opacity: pop(f, 30) }}>
          Caso: ElectroSteel S.A.
        </div>
        <div style={{ fontSize: 24, marginTop: 24, color: "#cfd8ea", opacity: pop(f, 45) }}>
          Diego Gamarra Cabello · Jeyson Rojas Ore · Liz Escobar Villalba
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const a = pop(f, 0, 12);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #23386b, ${NAVY} 60%, #0b1430)`, justifyContent: "center", alignItems: "center", fontFamily: FONT, color: "white", opacity: interpolate(f, [OUTRO - 20, OUTRO], [1, 0], clamp) }}>
      <div style={{ fontWeight: 800, fontSize: 96, color: AMBER, transform: `scale(${0.7 + 0.3 * a})`, opacity: a }}>
        ¡Gracias!
      </div>
      <div style={{ fontSize: 34, marginTop: 24, opacity: pop(f, 12) }}>
        Proyección de la demanda de energía eléctrica · ElectroSteel S.A.
      </div>
      <div style={{ display: "flex", gap: 40, marginTop: 50 }}>
        {Object.values(NAMES).map((n, k) => (
          <div key={n} style={{ padding: "16px 30px", borderRadius: 16, border: `2px solid ${BLUE}`, fontSize: 28, fontWeight: 700, opacity: pop(f, 24 + k * 8), transform: `translateY(${(1 - pop(f, 24 + k * 8)) * 30}px)` }}>
            {n}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 24, marginTop: 50, color: "#b9c6e4", opacity: pop(f, 55) }}>
        Universidad Continental · Estadística para Ingeniería
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ main
export const ElectroSteel: React.FC = () => {
  const f = useCurrentFrame();
  const enter = pop(f, INTRO - 10, 16);
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <Background />
      <div style={{ opacity: enter }}>
        <TopBar />
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 96,
            width: 1368,
            height: 770,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            transform: `scale(${0.94 + 0.06 * enter})`,
          }}
        >
          <div style={{ width: 1280, height: 720, transform: "scale(1.06875)", transformOrigin: "0 0", position: "relative" }}>
            <Stage />
          </div>
        </div>
        <Cam who="liz" x={1424} y={96} w={466} h={262} />
        <Cam who="diego" x={1424} y={374} w={202} h={278} />
        <Cam who="jeyson" x={1642} y={374} w={248} h={278} />
        <NowPanel />
        <Timeline />
      </div>
      {SEGS.map((g, k) => (
        <Sequence key={k} from={INTRO + g.from} durationInFrames={g.dur}>
          <Audio
            src={staticFile("es/voz.wav")}
            startFrom={Math.round(g.src * FPS)}
            volume={(x) => Math.min(1, (x + 1) / 3, (g.dur - x) / 3)}
          />
        </Sequence>
      ))}
      <Sequence durationInFrames={INTRO}>
        <Intro />
      </Sequence>
      <Sequence from={INTRO + ES.mainFrames} durationInFrames={OUTRO}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
