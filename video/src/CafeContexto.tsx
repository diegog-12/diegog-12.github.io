import "@fontsource/fraunces/800.css";
import "@fontsource/fraunces/500-italic.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/great-vibes/400.css";
import "@fontsource/anton/400.css";
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  interpolateColors,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CX } from "./cxData";
import { Eyes, Student } from "./RedesJaula";

// Problem (social media addiction) -> solution (Contexto, a phone-free cafe).
const FPS = 30;
const W = 1080;
const sec = (s: number) => s * FPS;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Brand palette (sampled from the Contexto logo).
const CAFE = "#4A2403";
const CANELA = "#D97A1E";
const MIEL = "#FAAF2F";
const CREMA = "#F2DBB4";
const PAPER = "#F0DBB6"; // logo background, so the full lockup blends in
const SERIF = "Fraunces, serif";
const BODY = "'DM Sans', sans-serif";

const pop = (f: number, delay = 0, damping = 12) =>
  spring({ frame: f - delay, fps: FPS, config: { damping } });

// ------------------------------------------------------------------ helpers
const Bubble: React.FC<{ x: number; y: number; s: number; flip?: boolean }> = ({
  x,
  y,
  s,
  flip,
}) => {
  const frame = useCurrentFrame();
  return (
    <svg
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${s}) scaleX(${flip ? -1 : 1})`,
        transformOrigin: "50% 100%",
        overflow: "visible",
      }}
      width={220}
      height={150}
      viewBox="0 0 220 150"
    >
      <path
        d="M30 10 h160 a24 24 0 0 1 24 24 v56 a24 24 0 0 1 -24 24 h-110 l-34 28 v-28 h-16 a24 24 0 0 1 -24 -24 v-56 a24 24 0 0 1 24 -24 z"
        fill={CREMA}
        stroke={CAFE}
        strokeWidth={7}
      />
      {[0, 1, 2].map((k) => (
        <circle
          key={k}
          cx={70 + k * 40}
          cy={62 - Math.max(0, Math.sin(frame / 5 - k)) * 8}
          r={11}
          fill={k === 1 ? CANELA : CAFE}
        />
      ))}
    </svg>
  );
};

const Steam: React.FC<{ x: number; y: number; scale?: number }> = ({
  x,
  y,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <svg
      style={{ position: "absolute", left: x, top: y, overflow: "visible" }}
      width={200 * scale}
      height={220 * scale}
      viewBox="0 0 200 220"
    >
      {[0, 1, 2].map((k) => {
        const o = (frame * 1.5 + k * 40) % 120;
        return (
          <path
            key={k}
            d={`M${50 + k * 50} ${200 - o} q-22 -30 0 -60 q22 -30 0 -60`}
            stroke="white"
            strokeWidth={12}
            strokeLinecap="round"
            fill="none"
            opacity={0.55 * (1 - o / 120)}
          />
        );
      })}
    </svg>
  );
};

const Cup: React.FC<{ x: number; y: number; w: number; logo?: boolean }> = ({
  x,
  y,
  w,
  logo,
}) => (
  <div style={{ position: "absolute", left: x, top: y, width: w }}>
    <svg viewBox="0 0 300 260" width={w} height={(w * 260) / 300}>
      <ellipse cx={140} cy={242} rx={140} ry={16} fill="#00000033" />
      <path
        d="M250 90 a46 46 0 0 1 0 92 h-14"
        stroke={CREMA}
        strokeWidth={22}
        fill="none"
      />
      <path d="M20 40 h240 l-24 180 a20 20 0 0 1 -20 18 h-152 a20 20 0 0 1 -20 -18 z" fill={CREMA} />
      <ellipse cx={140} cy={42} rx={120} ry={18} fill={CAFE} />
    </svg>
    {logo && (
      <div
        style={{
          position: "absolute",
          left: w * 0.2,
          top: w * 0.27,
          width: w * 0.5,
        }}
      >
        <Img src={staticFile("cx/simbolo.png")} style={{ width: "100%" }} />
      </div>
    )}
  </div>
);

const People: React.FC<{
  phones: boolean;
  happy: number;
  glow: number;
}> = ({ phones, happy, glow }) => {
  const seats = [
    { x: -60, y: 760, w: 520, hoodie: "#3b5b6e", skin: "#d9a07a" },
    { x: 280, y: 700, w: 520, hoodie: "#9c4a2f", skin: "#c68863", hair: "#3a2416" },
    { x: 620, y: 760, w: 520, hoodie: "#4d6b3c", skin: "#e2b08c" },
  ];
  return (
    <>
      {seats.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.w,
            height: (s.w * 800) / 600,
            transform: `rotate(${(i - 1) * (phones ? 2 : -3)}deg)`,
          }}
        >
          <Student
            phone={phones}
            glow={glow}
            lids={phones ? 0.55 : 0.1}
            smile={happy}
            hoodie={s.hoodie}
            skin={s.skin}
            hair={s.hair}
          />
        </div>
      ))}
    </>
  );
};

const Table: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{
      position: "absolute",
      left: -40,
      right: -40,
      top: 1330,
      height: 700,
      background: color,
      borderTop: "18px solid #00000040",
      borderRadius: "60px 60px 0 0",
    }}
  />
);

// ------------------------------------------------------------------- scenes
// Friends at the same table, each one lost in the phone.
const PhoneTable: React.FC<{ local: number; dur: number }> = ({ local, dur }) => {
  const z = interpolate(local, [0, dur], [1.12, 1.0]);
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 50% 45%, #1b2a40 0%, #06080e 75%)",
        transform: `scale(${z})`,
      }}
    >
      <People phones happy={0} glow={1} />
      <Table color="#2a2321" />
      <Cup x={170} y={1250} w={170} />
      <Cup x={720} y={1260} w={170} />
    </AbsoluteFill>
  );
};

// "What if there was a place to disconnect?" A warm door opens in the dark.
const Question: React.FC<{ local: number; dur: number }> = ({ local, dur }) => {
  const open = interpolate(local, [8, dur * 0.65], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const flood = interpolate(local, [dur * 0.75, dur], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#07090f" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 42%, rgba(250,175,47,${0.55 * open}) 0%, rgba(0,0,0,0) 60%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 340,
          top: 260,
          width: 400,
          height: 760,
          background: "#1a120c",
          border: `14px solid ${CAFE}`,
          borderRadius: "200px 200px 0 0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, ${MIEL}, ${CANELA})`,
            clipPath: `inset(0 ${50 - 50 * open}% 0 ${50 - 50 * open}%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 90,
            top: 230,
            width: 200,
            opacity: open,
            transform: `scale(${0.6 + 0.4 * open})`,
          }}
        >
          <Img src={staticFile("cx/simbolo.png")} style={{ width: "100%" }} />
        </div>
      </div>
      <AbsoluteFill style={{ background: CREMA, opacity: flood }} />
    </AbsoluteFill>
  );
};

// Brand reveal: the symbol pops in, then the name and slogan.
const Reveal: React.FC<{ local: number }> = ({ local }) => {
  const a = pop(local, 4, 11);
  const b = pop(local, 40, 14);
  const sparks = pop(local, 20, 9);
  return (
    <AbsoluteFill style={{ background: CREMA }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 30%, ${MIEL}55 0%, rgba(0,0,0,0) 55%)`,
        }}
      />
      {Array.from({ length: 12 }).map((_, i) => {
        const ang = (i / 12) * Math.PI * 2;
        const r = 330 + 60 * sparks;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 + Math.cos(ang) * r - 8,
              top: 560 + Math.sin(ang) * r - 30,
              width: 16,
              height: 60,
              borderRadius: 8,
              background: i % 2 ? MIEL : CANELA,
              transform: `rotate(${(ang * 180) / Math.PI + 90}deg) scale(${sparks})`,
              opacity: sparks * interpolate(local, [60, 120], [1, 0.35], clamp),
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 230,
          top: 290,
          width: 620,
          transform: `scale(${a}) rotate(${(1 - a) * -12}deg)`,
        }}
      >
        <Img src={staticFile("cx/simbolo.png")} style={{ width: "100%" }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 870,
          width: 900,
          opacity: b,
          transform: `translateY(${(1 - b) * 80}px)`,
        }}
      >
        <Img src={staticFile("cx/logotipo.png")} style={{ width: "100%" }} />
      </div>
    </AbsoluteFill>
  );
};

// The phone drops into the "caja de pausa" and the conversation starts.
const PauseBox: React.FC<{ local: number }> = ({ local }) => {
  const drop = interpolate(local, [15, 55], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const lid = interpolate(local, [60, 80], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.5)),
  });
  const ring = local < 55 ? Math.sin(local * 1.6) * 6 : 0;
  const talk = pop(local, 95, 12);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #6b3a14 0%, ${CAFE} 100%)`,
      }}
    >
      {/* phone with notifications */}
      <div
        style={{
          position: "absolute",
          left: 420,
          top: 160 + drop * 640,
          width: 240,
          height: 440,
          borderRadius: 40,
          background: "#0d0f14",
          border: "10px solid #2a2f3a",
          transform: `rotate(${ring + drop * 8}deg)`,
          opacity: interpolate(local, [50, 58], [1, 0], clamp),
          boxShadow: "0 0 60px #3a86ff88",
        }}
      >
        {[0, 1, 2, 3].map((k) => (
          <div
            key={k}
            style={{
              margin: "22px 18px 0",
              height: 60,
              borderRadius: 14,
              background: ["#ff4d6d", "#3a86ff", "#ffbe0b", "#8338ec"][k],
              opacity: 0.85,
            }}
          />
        ))}
      </div>
      {/* box */}
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 820,
          width: 680,
          height: 400,
          background: CANELA,
          borderRadius: "0 0 30px 30px",
          border: `12px solid ${CAFE}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
        }}
      >
        <div
          style={{
            width: 170,
            height: 170,
            borderRadius: 85,
            background: CREMA,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Img src={staticFile("cx/simbolo.png")} style={{ width: 130 }} />
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: 64,
            lineHeight: 0.95,
            color: CREMA,
          }}
        >
          caja de
          <br />
          pausa
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 180,
          top: 790,
          width: 720,
          height: 50,
          background: "#8a4a17",
          border: `12px solid ${CAFE}`,
          borderRadius: 18,
          transformOrigin: "0% 100%",
          transform: `rotate(${(1 - lid) * -70}deg)`,
        }}
      />
      {/* conversation starts */}
      <Bubble x={90} y={330} s={talk * 1.5} />
      <Bubble x={700} y={460} s={pop(local, 115, 12) * 1.3} flip />
    </AbsoluteFill>
  );
};

// Each cup comes with a curious fact to break the ice.
const CupFact: React.FC<{ local: number }> = ({ local }) => {
  const card = pop(local, 35, 14);
  const z = interpolate(local, [0, 210], [1.0, 1.08]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 60%, ${MIEL} 0%, ${CANELA} 70%)`,
        transform: `scale(${z})`,
      }}
    >
      <Steam x={330} y={360} scale={1.6} />
      <Cup x={170} y={640} w={700} logo />
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 130,
          width: 840,
          padding: "34px 40px",
          boxSizing: "border-box",
          background: CREMA,
          border: `8px solid ${CAFE}`,
          borderRadius: 26,
          transform: `translateY(${(1 - card) * -260}px) rotate(${(1 - card) * 8 - 2}deg)`,
          opacity: card,
          boxShadow: "0 18px 40px #0005",
        }}
      >
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: 6,
            color: CANELA,
          }}
        >
          DATO DEL DÍA
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 50,
            lineHeight: 1.15,
            color: CAFE,
            marginTop: 10,
          }}
        >
          Las nutrias se toman de la mano al dormir para no separarse.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Phone-free cafe: friends talking, board games, music, coffee.
const Cafe: React.FC<{ local: number; dur: number }> = ({ local, dur }) => {
  const frame = useCurrentFrame();
  const z = interpolate(local, [0, dur], [1.0, 1.1]);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #f7c77e 0%, ${CANELA} 70%)`,
        transform: `scale(${z})`,
      }}
    >
      {/* hanging lamps */}
      {[200, 540, 880].map((x, i) => (
        <div key={x}>
          <div
            style={{
              position: "absolute",
              left: x - 3,
              top: 0,
              width: 6,
              height: 150 + i * 30,
              background: CAFE,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: x - 70,
              top: 150 + i * 30,
              width: 140,
              height: 70,
              borderRadius: "70px 70px 0 0",
              background: CAFE,
              boxShadow: `0 60px 120px 30px ${MIEL}aa`,
            }}
          />
        </div>
      ))}
      {/* music notes */}
      {[0, 1, 2, 3].map((k) => {
        const t = (frame * 2 + k * 90) % 360;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 120 + k * 250 + Math.sin(t / 30) * 30,
              top: 700 - t,
              fontSize: 80,
              color: CAFE,
              opacity: 0.6 * Math.sin((t / 360) * Math.PI),
            }}
          >
            ♪
          </div>
        );
      })}
      <People phones={false} happy={1} glow={0} />
      <Bubble x={60} y={520} s={pop(local, 10) * 1.1} />
      <Bubble x={760} y={480} s={pop(local, 40) * 1.1} flip />
      <Table color="#6b3a14" />
      {/* board game: board + dice */}
      <div
        style={{
          position: "absolute",
          left: 380,
          top: 1380,
          width: 320,
          height: 200,
          borderRadius: 12,
          background:
            `repeating-conic-gradient(${CREMA} 0 25%, ${CANELA} 0 50%) 0 0 / 80px 80px`,
          border: `8px solid ${CAFE}`,
          transform: "perspective(600px) rotateX(35deg)",
        }}
      />
      {[0, 1].map((k) => {
        const roll = pop(local, 160 + k * 6, 10);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 470 + k * 100,
              top: 1300 + (1 - roll) * -200,
              width: 70,
              height: 70,
              borderRadius: 14,
              background: "white",
              border: `5px solid ${CAFE}`,
              transform: `rotate(${(1 - roll) * 360 + k * 15}deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 40,
              color: CAFE,
            }}
          >
            {k ? "⚃" : "⚄"}
          </div>
        );
      })}
      <Cup x={110} y={1290} w={180} logo />
      <Cup x={800} y={1300} w={180} logo />
    </AbsoluteFill>
  );
};

// Closing card: full lockup and the call to action.
const End: React.FC<{ local: number }> = ({ local }) => {
  const a = pop(local, 0, 14);
  const b = pop(local, 60, 14);
  return (
    <AbsoluteFill style={{ background: PAPER, alignItems: "center" }}>
      <div
        style={{
          marginTop: 300,
          width: 1000,
          transform: `scale(${0.85 + 0.15 * a})`,
          opacity: a,
        }}
      >
        <Img src={staticFile("cx/logo_contexto.png")} style={{ width: "100%" }} />
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: SERIF,
          fontWeight: 800,
          fontSize: 64,
          lineHeight: 1.1,
          color: CAFE,
          textAlign: "center",
          opacity: b,
          transform: `translateY(${(1 - b) * 40}px)`,
        }}
      >
        Desconéctate de la pantalla.
        <br />
        <span style={{ color: CANELA }}>Conéctate con las personas.</span>
      </div>
    </AbsoluteFill>
  );
};

// What the symbol means: callouts on the person, the cup and the bubble.
const Meaning: React.FC<{ local: number; start: number }> = ({ local, start }) => {
  const a = pop(local, 0, 14);
  const z = interpolate(local, [0, 330], [1.0, 1.06]);
  const calls = [
    { at: CX.marks["piensa"], label: "alguien que piensa", lx: 60, ly: 300, px: 474, py: 594 },
    { at: CX.marks["café"], label: "su café en la mano", lx: 60, ly: 1150, px: 493, py: 845 },
    { at: CX.marks["conversación"], label: "una conversación", lx: 560, ly: 260, px: 738, py: 518 },
  ];
  return (
    <AbsoluteFill style={{ background: CREMA, transform: `scale(${z})` }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, ${MIEL}44 0%, rgba(0,0,0,0) 60%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 380,
          width: 760,
          opacity: a,
          transform: `scale(${0.9 + 0.1 * a})`,
        }}
      >
        <Img src={staticFile("cx/simbolo.png")} style={{ width: "100%" }} />
      </div>
      <svg style={{ position: "absolute", inset: 0 }} width={1080} height={1920}>
        {calls.map((c, i) => {
          const p = pop(local, c.at - start, 15);
          const ex = c.lx + 220;
          const ey = c.ly + (c.ly < c.py ? 90 : 0);
          return (
            <g key={i} opacity={p}>
              <line
                x1={ex}
                y1={ey}
                x2={ex + (c.px - ex) * p}
                y2={ey + (c.py - ey) * p}
                stroke={CAFE}
                strokeWidth={5}
                strokeDasharray="14 10"
              />
              <circle cx={c.px} cy={c.py} r={16 * p} fill={CANELA} stroke={CREMA} strokeWidth={5} />
            </g>
          );
        })}
      </svg>
      {calls.map((c, i) => {
        const p = pop(local, c.at - start, 13);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.lx,
              top: c.ly,
              width: 440,
              height: 90,
              borderRadius: 45,
              background: i === 2 ? MIEL : CAFE,
              color: i === 2 ? CAFE : CREMA,
              fontFamily: SERIF,
              fontWeight: 800,
              fontSize: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${p})`,
              opacity: p,
              boxShadow: "0 10px 26px #0003",
            }}
          >
            {c.label}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// The slogan, word by word: un dato, un sorbo, un buen rato.
const Slogan: React.FC<{ local: number; start: number }> = ({ local, start }) => {
  const rows = [
    { at: CX.marks["dato"], text: "Un dato,", bg: CREMA, fg: CAFE, icon: "?" },
    { at: CX.marks["sorbo"], text: "un sorbo", bg: MIEL, fg: CAFE, icon: "☕" },
    { at: CX.marks["rato"], text: "y un buen rato", bg: CANELA, fg: CREMA, icon: "☺" },
  ];
  return (
    <AbsoluteFill style={{ background: CAFE }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 35%, ${CANELA}66 0%, rgba(0,0,0,0) 60%)`,
        }}
      />
      {rows.map((r, i) => {
        const p = pop(local, r.at - start - 4, 12);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 90,
              top: 230 + i * 320,
              width: 900,
              height: 250,
              borderRadius: 40,
              background: r.bg,
              display: "flex",
              alignItems: "center",
              gap: 36,
              padding: "0 50px",
              boxSizing: "border-box",
              transform: `translateX(${(1 - p) * (i % 2 ? 1 : -1) * 1100}px) rotate(${(i - 1) * 2}deg)`,
              boxShadow: "0 16px 40px #0006",
            }}
          >
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: 75,
                background: r.fg,
                color: r.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: SERIF,
                fontWeight: 800,
                fontSize: 90,
                flexShrink: 0,
              }}
            >
              {r.icon}
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: 92,
                color: r.fg,
                lineHeight: 1,
              }}
            >
              {r.text}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------- scene switcher
const renderScene = (id: string, local: number, dur: number, start: number) => {
  switch (id) {
    case "eyes":
      return <Eyes />;
    case "table":
      return <PhoneTable local={local} dur={dur} />;
    case "question":
      return <Question local={local} dur={dur} />;
    case "reveal":
      return <Reveal local={local} />;
    case "meaning":
      return <Meaning local={local} start={start} />;
    case "box":
      return <PauseBox local={local} />;
    case "cup":
      return <CupFact local={local} />;
    case "cafe":
      return <Cafe local={local} dur={dur} />;
    case "slogan":
      return <Slogan local={local} start={start} />;
    default:
      return <End local={local} />;
  }
};

type Scene = (typeof CX.scenes)[number];
const sceneAt = (f: number): Scene =>
  CX.scenes.find((s) => f >= s.from && f < s.to) ??
  CX.scenes[CX.scenes.length - 1];
const draw = (s: Scene, f: number) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    {renderScene(s.id, f - s.from, s.to - s.from, s.from)}
  </AbsoluteFill>
);

// Whip pans between the solution scenes; glitch cuts in the problem part.
const WHIPS = [sec(28), sec(39), sec(47), sec(55.5), sec(65), sec(75)];
const Scenes: React.FC = () => {
  const frame = useCurrentFrame();
  const at = WHIPS.find((w) => Math.abs(frame - w) < 8);
  if (at !== undefined) {
    const wp = interpolate(frame, [at - 8, at + 8], [0, 1], clamp);
    const e = Easing.inOut(Easing.cubic)(wp);
    return (
      <AbsoluteFill style={{ filter: `blur(${Math.sin(wp * Math.PI) * 28}px)` }}>
        <AbsoluteFill style={{ transform: `translateX(${-e * W}px)` }}>
          {draw(sceneAt(at - 1), frame)}
        </AbsoluteFill>
        <AbsoluteFill style={{ transform: `translateX(${(1 - e) * W}px)` }}>
          {draw(sceneAt(at), frame)}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return draw(sceneAt(frame), frame);
};

const GLITCH_AT = [sec(6), sec(13.5)];
const Glitch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const near = GLITCH_AT.find((g) => Math.abs(frame - g) <= 6);
  const inCage =
    frame < sec(13) && random(`c${Math.floor(frame / 3)}`) > 0.93;
  if (near === undefined && !inCage) return <>{children}</>;
  const amt = near !== undefined ? 1 - Math.abs(frame - near) / 7 : 0.5;
  const r = (k: string) => (random(`${k}${frame}`) - 0.5) * 2;
  return (
    <AbsoluteFill>
      {children}
      {[
        [18, "sepia(1) saturate(9) hue-rotate(-50deg)"],
        [-18, "sepia(1) saturate(9) hue-rotate(150deg)"],
      ].map(([dx, f], k) => (
        <AbsoluteFill
          key={k}
          style={{
            mixBlendMode: "screen",
            opacity: 0.6 * amt,
            transform: `translateX(${(dx as number) * amt}px)`,
            filter: f as string,
          }}
        >
          {children}
        </AbsoluteFill>
      ))}
      {[0, 1, 2, 3].map((k) => {
        const top = Math.abs(r(`t${k}`)) * 90;
        return (
          <AbsoluteFill
            key={k}
            style={{
              clipPath: `inset(${top}% 0 ${Math.max(0, 100 - top - 6)}% 0)`,
              transform: `translateX(${r(`x${k}`) * 90 * amt}px)`,
            }}
          >
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

// Warm -> cold blue during the problem, brand warmth after the door opens.
const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const c = interpolateColors(
    frame,
    [0, sec(3), sec(8), sec(13), sec(17), sec(90)],
    ["#ff9f43", "#2e86de", "#1e3799", "#1e3799", "#ffb142", "#ffb142"],
  );
  const op = interpolate(frame, [sec(16), sec(19)], [0.45, 0.18], clamp);
  return (
    <>
      <AbsoluteFill style={{ background: c, mixBlendMode: "soft-light", opacity: op }} />
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${frame < sec(17) ? 0.5 : 0.25}) 100%)`,
        }}
      />
    </>
  );
};

// Captions in the same TikTok style as the first video; the solution part
// switches the neon to the brand colors.
const SANS = "Inter, sans-serif";
const SCRIPT = "'Great Vibes', cursive";
const CAPS = "Anton, sans-serif";
const neon = (c: string) =>
  `0 0 6px ${c}, 0 0 18px ${c}, 0 0 42px ${c}, 0 4px 10px rgba(0,0,0,0.6)`;

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const ci = CX.captions.findIndex((c) => frame >= c.from && frame < c.to);
  if (ci < 0) return null;
  const cap = CX.captions[ci];
  const solution = frame >= sec(18);
  const neonColor = solution
    ? ci % 2
      ? MIEL
      : "#ffe9b0"
    : ci % 2
      ? "#ff2d3d"
      : "#ffe14d";
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            `linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(20,8,0,${solution ? 0.32 : 0.55}) 70%, rgba(20,8,0,${solution ? 0.32 : 0.55}) 88%, rgba(0,0,0,0) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          top: 1290,
          height: 420,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          gap: "0 16px",
          padding: "0 70px",
        }}
      >
        {cap.words.map((w, i) => {
          if (frame < w.t) return null;
          const p = spring({ frame: frame - w.t, fps: FPS, config: { damping: 14 } });
          const reveal: React.CSSProperties = {
            display: "inline-block",
            opacity: p,
            filter: `blur(${(1 - p) * 14}px)`,
            transform: `translateY(${(1 - p) * 24}px) scale(${0.9 + 0.1 * p})`,
          };
          if (w.style === "script") {
            return (
              <span
                key={i}
                style={{
                  ...reveal,
                  fontFamily: SCRIPT,
                  fontSize: 180,
                  lineHeight: 0.9,
                  color: neonColor,
                  textShadow: neon(solution ? CANELA : neonColor),
                  transform: `${reveal.transform} rotate(-6deg)`,
                  padding: "0 10px",
                  flexBasis: "100%",
                  textAlign: "center",
                }}
              >
                {w.w}
              </span>
            );
          }
          if (w.style === "shout") {
            return (
              <span
                key={i}
                style={{
                  ...reveal,
                  fontFamily: CAPS,
                  fontSize: 170,
                  lineHeight: 1,
                  color: solution ? CANELA : "#e5121b",
                  textTransform: "uppercase",
                  textShadow: "0 6px 24px rgba(0,0,0,0.7)",
                  flexBasis: "100%",
                  textAlign: "center",
                }}
              >
                {w.w}
              </span>
            );
          }
          return (
            <span
              key={i}
              style={{
                ...reveal,
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 66,
                letterSpacing: -2.5,
                color: "white",
                textTransform: "lowercase",
                textShadow: "0 3px 14px rgba(0,0,0,0.85)",
                lineHeight: 1.2,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </AbsoluteFill>
    </>
  );
};

export const CafeContexto: React.FC = () => {
  const musicVolume = (f: number) => {
    const speaking = CX.captions.some((c) => f >= c.from - 6 && f < c.to + 6);
    const fadeOut = interpolate(f, [CX.duration - 60, CX.duration], [1, 0], clamp);
    return (speaking ? 0.3 : 0.6) * interpolate(f, [0, 15], [0, 1], clamp) * fadeOut;
  };
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Glitch>
        <Scenes />
      </Glitch>
      <Grade />
      <Captions />
      <Audio src={staticFile("cx/musica.wav")} volume={musicVolume} />
      {CX.voice.map((v, i) => (
        <Sequence key={i} from={v.from}>
          <Audio src={staticFile(v.src)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
