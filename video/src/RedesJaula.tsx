import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
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
import { RS } from "./rsData";

// Original animated piece: a student trapped by social media notifications.
const FPS = 30;
const W = 1080;
const H = 1920;
const YELLOW = "#ffd60a";
const FONT = "Montserrat, sans-serif";
const sec = (s: number) => s * FPS;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------------------------------------------------------------- character
const Student: React.FC<{
  glow?: number; // blue phone light on the face 0..1
  phone?: boolean;
  screenOn?: number; // 0..1
  smile?: number; // 0 tired .. 1 smiling
  lids?: number; // eyelid closure 0..1
  keyGlow?: number;
  books?: boolean;
  hoodie?: string;
  skin?: string;
  hair?: string;
}> = ({
  glow = 0,
  phone = true,
  screenOn = 1,
  smile = 0,
  lids = 0.45,
  keyGlow = 0,
  books = false,
  hoodie = "#3b5b6e",
  skin = "#d9a07a",
  hair = "#1b1716",
}) => {
  const frame = useCurrentFrame();
  const thumb = Math.sin(frame / 4) * 22;
  const lid = 14 * lids + 2;
  return (
    <svg viewBox="0 0 600 800" width="100%" height="100%">
      <defs>
        <radialGradient id="faceGlow" cx="50%" cy="80%" r="70%">
          <stop offset="0%" stopColor="#7fd3ff" stopOpacity={0.85 * glow} />
          <stop offset="100%" stopColor="#1b6cff" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="keyG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3b0" stopOpacity={keyGlow} />
          <stop offset="100%" stopColor="#ffb703" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* body / hoodie */}
      <path
        d="M90 800 C90 560 170 470 300 470 C430 470 510 560 510 800 Z"
        fill={hoodie}
      />
      <path
        d="M250 470 Q300 540 350 470"
        fill="none"
        stroke="#24394a"
        strokeWidth={10}
      />
      {/* neck + head */}
      <rect x={265} y={380} width={70} height={100} rx={30} fill={skin} />
      <ellipse cx={300} cy={290} rx={118} ry={132} fill={skin} />
      <ellipse cx={184} cy={300} rx={18} ry={28} fill={skin} />
      <ellipse cx={416} cy={300} rx={18} ry={28} fill={skin} />
      {/* hair */}
      <path
        d="M178 270 C170 160 240 120 310 128 C390 130 440 180 424 280 C410 220 380 200 330 196 C300 220 240 215 210 200 C195 215 186 240 178 270 Z"
        fill={hair}
      />
      {/* eyes */}
      {[250, 350].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={300} rx={22} ry={16} fill="white" />
          <circle cx={x} cy={302} r={9} fill="#2b1d14" />
          <circle
            cx={x + 3}
            cy={298}
            r={3}
            fill={glow > 0.2 ? "#bfe9ff" : "white"}
          />
          <rect x={x - 24} y={284} width={48} height={lid} fill={skin} />
          {smile < 0.5 && (
            <path
              d={`M${x - 20} 322 Q${x} 330 ${x + 20} 322`}
              stroke="#8a5a4a"
              strokeWidth={3}
              fill="none"
              opacity={0.6}
            />
          )}
          <path
            d={`M${x - 26} 270 L${x + 22} ${266 + (smile > 0.5 ? -4 : 4)}`}
            stroke={hair}
            strokeWidth={8}
            strokeLinecap="round"
          />
        </g>
      ))}
      <path
        d="M300 315 Q292 345 302 350"
        stroke="#a86f52"
        strokeWidth={4}
        fill="none"
      />
      <path
        d={`M270 ${375 - smile * 4} Q300 ${375 + smile * 22} 330 ${375 - smile * 4}`}
        stroke="#7a3b2e"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={300} cy={300} rx={118} ry={132} fill="url(#faceGlow)" />
      {/* arms + hands */}
      <path
        d="M150 600 C170 660 240 640 280 600"
        stroke={hoodie}
        strokeWidth={70}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M450 600 C430 660 360 640 320 600"
        stroke={hoodie}
        strokeWidth={70}
        fill="none"
        strokeLinecap="round"
      />
      {phone && (
        <g>
          <rect
            x={250}
            y={500}
            width={100}
            height={170}
            rx={16}
            fill="#0d0f14"
          />
          <rect
            x={258}
            y={510}
            width={84}
            height={150}
            rx={10}
            fill={interpolateColors(screenOn, [0, 1], ["#05070a", "#8fd8ff"])}
          />
          {screenOn > 0.5 &&
            [0, 1, 2, 3].map((k) => (
              <rect
                key={k}
                x={266}
                y={520 + ((k * 42 + frame * 6) % 150)}
                width={68}
                height={30}
                rx={5}
                fill="#3a86ff"
                opacity={0.6}
              />
            ))}
          <ellipse cx={300} cy={600 + thumb} rx={22} ry={16} fill={skin} />
        </g>
      )}
      <ellipse cx={268} cy={610} rx={30} ry={24} fill={skin} />
      <ellipse cx={332} cy={610} rx={30} ry={24} fill={skin} />
      {keyGlow > 0 && (
        <g opacity={keyGlow}>
          <circle cx={300} cy={560} r={150} fill="url(#keyG)" />
          <circle
            cx={300}
            cy={520}
            r={26}
            fill="none"
            stroke="#ffc300"
            strokeWidth={12}
          />
          <rect x={294} y={544} width={12} height={70} fill="#ffc300" />
          <rect x={306} y={588} width={22} height={10} fill="#ffc300" />
          <rect x={306} y={604} width={16} height={10} fill="#ffc300" />
        </g>
      )}
      {books && (
        <g>
          <rect x={330} y={540} width={140} height={30} rx={4} fill="#e63946" />
          <rect x={336} y={510} width={130} height={30} rx={4} fill="#457b9d" />
          <rect x={344} y={482} width={116} height={28} rx={4} fill="#f4a261" />
        </g>
      )}
    </svg>
  );
};

// ------------------------------------------------------------- notifications
const ICONS = ["heart", "chat", "bell", "play", "like", "plus"] as const;
type IconKind = (typeof ICONS)[number];
const Icon: React.FC<{ kind: IconKind; size: number; badge?: string }> = ({
  kind,
  size,
  badge,
}) => {
  const colors: Record<IconKind, string> = {
    heart: "#ff4d6d",
    chat: "#3a86ff",
    bell: "#ffbe0b",
    play: "#ff006e",
    like: "#4cc9f0",
    plus: "#8338ec",
  };
  const c = colors[kind];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ overflow: "visible" }}
    >
      <rect x={4} y={4} width={92} height={92} rx={26} fill={c} />
      {kind === "heart" && (
        <path
          d="M50 76 L24 50 C14 38 26 22 40 30 L50 38 L60 30 C74 22 86 38 76 50 Z"
          fill="white"
        />
      )}
      {kind === "chat" && (
        <path
          d="M22 30 h56 a8 8 0 0 1 8 8 v24 a8 8 0 0 1 -8 8 h-30 l-16 12 v-12 h-10 a8 8 0 0 1 -8 -8 v-24 a8 8 0 0 1 8 -8 z"
          fill="white"
        />
      )}
      {kind === "bell" && (
        <path
          d="M50 20 c-14 0 -22 12 -22 26 v14 l-8 10 h60 l-8 -10 v-14 c0 -14 -8 -26 -22 -26 z M42 74 a8 8 0 0 0 16 0 z"
          fill="white"
        />
      )}
      {kind === "play" && <path d="M38 28 L74 50 L38 72 Z" fill="white" />}
      {kind === "like" && (
        <path
          d="M26 46 h12 v30 h-12 z M42 46 l12 -22 c6 0 8 4 7 10 l-2 10 h16 c5 0 8 4 7 9 l-5 18 c-1 4 -4 5 -8 5 h-27 z"
          fill="white"
        />
      )}
      {kind === "plus" && (
        <path
          d="M44 24 h12 v20 h20 v12 h-20 v20 h-12 v-20 h-20 v-12 h20 z"
          fill="white"
        />
      )}
      {badge && (
        <g>
          <circle
            cx={88}
            cy={12}
            r={20}
            fill="#ef233c"
            stroke="white"
            strokeWidth={4}
          />
          <text
            x={88}
            y={19}
            fontSize={20}
            fontWeight={900}
            fontFamily={FONT}
            fill="white"
            textAnchor="middle"
          >
            {badge}
          </text>
        </g>
      )}
    </svg>
  );
};

// ------------------------------------------------------------------- scenes
const sky = (p: number) =>
  interpolateColors(
    p % 1,
    [0, 0.2, 0.3, 0.5, 0.7, 0.8, 1],
    [
      "#050a1f",
      "#0b1240",
      "#f28f5b",
      "#7ec8ff",
      "#f4845f",
      "#1b1b4a",
      "#050a1f",
    ],
  );

const Window: React.FC<{
  phase: number;
  x: number;
  y: number;
  w: number;
  h: number;
}> = ({ phase, x, y, w, h }) => {
  const p = phase % 1;
  const day = Math.sin(p * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5;
  const sunA = p * Math.PI * 2;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        overflow: "hidden",
        border: "18px solid #2a2f3a",
        borderRadius: 8,
        background: sky(p),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: w / 2 - 40 + Math.cos(sunA - Math.PI / 2) * w * 0.4,
          top: h * 0.75 + Math.sin(sunA - Math.PI / 2) * h * 0.55,
          width: 80,
          height: 80,
          borderRadius: 40,
          background: day > 0.4 ? "#ffd166" : "#f1f1f1",
          boxShadow: `0 0 60px ${day > 0.4 ? "#ffd166" : "#cfd8ff"}`,
        }}
      />
      {[0, 1, 2].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            top: 60 + k * 90,
            left: ((k * 300 + phase * 1600) % (w + 300)) - 300,
            width: 260,
            height: 60,
            borderRadius: 40,
            background: "white",
            opacity: 0.15 + 0.5 * day,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: h * 0.25,
          background: "#0d1b2a",
          clipPath:
            "polygon(0 60%, 15% 20%, 30% 50%, 50% 10%, 70% 55%, 85% 25%, 100% 50%, 100% 100%, 0 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: w / 2 - 9,
          top: 0,
          bottom: 0,
          width: 18,
          background: "#2a2f3a",
        }}
      />
    </div>
  );
};

const Clock: React.FC<{ speed: number; x: number; y: number }> = ({
  speed,
  x,
  y,
}) => {
  const frame = useCurrentFrame();
  return (
    <svg
      style={{ position: "absolute", left: x, top: y }}
      width={150}
      height={150}
      viewBox="0 0 100 100"
    >
      <circle
        cx={50}
        cy={50}
        r={46}
        fill="#e9e4d8"
        stroke="#2a2f3a"
        strokeWidth={6}
      />
      <line
        x1={50}
        y1={50}
        x2={50}
        y2={22}
        stroke="#222"
        strokeWidth={5}
        strokeLinecap="round"
        transform={`rotate(${frame * speed} 50 50)`}
      />
      <line
        x1={50}
        y1={50}
        x2={50}
        y2={30}
        stroke="#c1121f"
        strokeWidth={3}
        strokeLinecap="round"
        transform={`rotate(${frame * speed * 12} 50 50)`}
      />
    </svg>
  );
};

const Eyes: React.FC = () => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, sec(7)], [1.0, 1.25]);
  const blink = [60, 150].some((b) => frame > b && frame < b + 6) ? 1 : 0.42;
  const flicker = 0.7 + 0.3 * Math.sin(frame * 1.3) * Math.sin(frame * 0.37);
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 55%, #2c5d86 0%, #0b1220 70%)",
        transform: `scale(${z})`,
      }}
    >
      <svg viewBox="0 0 1080 1920" width={W} height={H}>
        <rect width={W} height={H} fill="#c98f6c" opacity={0.0} />
        {[300, 780].map((x) => (
          <g key={x}>
            <ellipse
              cx={x}
              cy={1010}
              rx={210}
              ry={70}
              fill="#5b3a4a"
              opacity={0.45}
            />
            <ellipse cx={x} cy={900} rx={200} ry={120} fill="#f7f1ef" />
            {[0, 1, 2].map((k) => (
              <path
                key={k}
                d={`M${x - 190} ${880 + k * 20} q60 ${10 - k * 8} 100 ${4 + k * 6}`}
                stroke="#d64545"
                strokeWidth={3}
                fill="none"
                opacity={0.5}
              />
            ))}
            <circle cx={x} cy={910} r={90} fill="#3d2b1f" />
            <circle cx={x} cy={910} r={44} fill="#0b0b0b" />
            <rect
              x={x + 10}
              y={860}
              width={34}
              height={56}
              rx={6}
              fill="#bfe9ff"
              opacity={flicker}
            />
            <rect
              x={x - 205}
              y={770}
              width={410}
              height={130 * blink + 10}
              fill="#c98f6c"
            />
            <path
              d={`M${x - 200} ${780 + 130 * blink} Q${x} ${760 + 130 * blink} ${x + 200} ${780 + 130 * blink}`}
              stroke="#5a3a2a"
              strokeWidth={10}
              fill="none"
            />
          </g>
        ))}
      </svg>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 85%, rgba(80,170,255,${0.35 * flicker}) 0%, rgba(0,0,0,0) 60%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Room: React.FC<{ local: number; dur: number }> = ({ local, dur }) => {
  const z = interpolate(local, [0, dur], [1.0, 1.18], {
    easing: Easing.inOut(Easing.sin),
  });
  const rot = interpolate(local, [0, dur], [-1.5, 1.5]);
  const lamp = interpolate(local, [0, dur * 0.6, dur], [1, 0.8, 0.25]);
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg,#161b26 0%,#0e1119 70%,#1b1410 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          filter: "blur(5px)",
          transform: `scale(${z * 1.05}) rotate(${rot * 0.5}deg)`,
        }}
      >
        <Window phase={0.05} x={620} y={240} w={380} h={500} />
        <Clock speed={0.3} x={150} y={300} />
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 860,
            width: 280,
            height: 520,
            background: `radial-gradient(ellipse at 50% 0%, rgba(255,190,110,${0.55 * lamp}) 0%, rgba(0,0,0,0) 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 150,
            top: 820,
            width: 110,
            height: 60,
            borderRadius: "60px 60px 0 0",
            background: "#e0a458",
            opacity: 0.4 + 0.6 * lamp,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1480,
            height: 440,
            background: "#241c18",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            top: 1380,
            height: 200,
            borderRadius: 30,
            background: "#40506a",
          }}
        />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 560,
          width: 800,
          height: 1067,
          transform: `scale(${z}) rotate(${rot}deg)`,
        }}
      >
        <Student glow={0.9} lids={0.5} />
      </div>
    </AbsoluteFill>
  );
};

const Timelapse: React.FC<{ local: number; dur: number }> = ({
  local,
  dur,
}) => {
  const phase = interpolate(local, [0, dur], [0.05, 2.05]);
  const day = Math.sin((phase % 1) * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5;
  const z = interpolate(local, [0, dur], [1.15, 1.0]);
  return (
    <AbsoluteFill
      style={{
        background: interpolateColors(day, [0, 1], ["#0c0f17", "#3a4256"]),
        transform: `scale(${z})`,
      }}
    >
      <Window phase={phase} x={90} y={180} w={900} h={1000} />
      <Clock speed={18} x={830} y={1230} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1500,
          height: 420,
          background: "#1a1512",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 290,
          top: 1100,
          width: 500,
          height: 667,
          filter: `brightness(${0.35 + 0.5 * day})`,
        }}
      >
        <Student glow={0.9 * (1 - day)} lids={0.6} />
      </div>
    </AbsoluteFill>
  );
};

const Notifs: React.FC<{ local: number; dur: number; cage?: number }> = ({
  local,
  dur,
  cage = 0,
}) => {
  const n = Math.min(26, Math.floor(local / 9) + 1);
  const z = interpolate(local, [0, dur], [1.0, 1.1]);
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 55%, #10233d 0%, #05070d 75%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 640,
          width: 700,
          height: 933,
          transform: `scale(${z})`,
        }}
      >
        <Student glow={1} lids={0.55 + 0.2 * cage} />
      </div>
      {Array.from({ length: n }).map((_, i) => {
        const born = i * 9;
        const p = spring({
          frame: local - born,
          fps: FPS,
          config: { damping: 12 },
        });
        const ang = random(`a${i}`) * Math.PI * 2 + local / 60;
        const rad = 330 + random(`r${i}`) * 260;
        const fx = 540 + Math.cos(ang) * rad;
        const fy = 1050 + Math.sin(ang) * rad * 1.25;
        // inside the cage the icons line up into vertical bars
        const col = i % 7;
        const row = Math.floor(i / 7);
        const cx = 120 + col * 140;
        const cy = 380 + ((row * 340 + local * 3 + col * 90) % 1400);
        const x = interpolate(cage, [0, 1], [fx, cx]);
        const y = interpolate(cage, [0, 1], [fy, cy]);
        const size = 110 + random(`s${i}`) * 50;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              transform: `scale(${p})`,
              opacity: p,
            }}
          >
            <Icon
              kind={ICONS[i % ICONS.length]}
              size={size}
              badge={
                i % 3 === 0
                  ? `${((i * 7) % 99) + 1}`
                  : i % 5 === 0
                    ? "99+"
                    : undefined
              }
            />
          </div>
        );
      })}
      {cage > 0 &&
        Array.from({ length: 7 }).map((_, c) => (
          <div
            key={c}
            style={{
              position: "absolute",
              left: 120 + c * 140 - 6,
              top: 220 * (1 - cage),
              width: 12,
              height: 1700 * cage,
              background: "linear-gradient(180deg,#4cc9f0,#3a0ca3)",
              opacity: 0.55 * cage,
              boxShadow: "0 0 20px #4cc9f0",
            }}
          />
        ))}
    </AbsoluteFill>
  );
};

const GlitchWords: React.FC<{ local: number }> = ({ local }) => {
  const words = ["MENOS SUEÑO", "MENOS CONCENTRACIÓN", "MÁS ANSIEDAD"];
  const idx = Math.min(2, Math.floor(local / 40));
  if (local < 0 || local > 125) return null;
  const j = (k: number) => (random(`g${Math.floor(local / 2)}${k}`) - 0.5) * 30;
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", top: -380 }}
    >
      {[
        ["#ff006e", j(1)],
        ["#00f5d4", j(2)],
        ["white", 0],
      ].map(([c, dx], k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: idx === 1 ? 78 : 110,
            color: c as string,
            transform: `translateX(${dx}px)`,
            mixBlendMode: k < 2 ? "screen" : "normal",
            opacity: k < 2 ? 0.8 : 1,
            textAlign: "center",
            width: 1000,
          }}
        >
          {words[idx]}
        </div>
      ))}
    </AbsoluteFill>
  );
};

const Turn: React.FC<{ local: number }> = ({ local }) => {
  const off = interpolate(local, [0, 20], [1, 0], clamp);
  const key = interpolate(local, [25, 55], [0, 1], clamp);
  const warm = interpolate(local, [40, 150], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        background: interpolateColors(warm, [0, 1], ["#05070d", "#3b2414"]),
      }}
    >
      {Array.from({ length: 7 }).map((_, c) => (
        <div
          key={c}
          style={{
            position: "absolute",
            left: 120 + c * 140 - 6 + (c - 3) * key * 300,
            top: 220,
            width: 12,
            height: 1700,
            background: "#4cc9f0",
            opacity: 0.55 * (1 - key),
            transform: `rotate(${(c - 3) * key * 25}deg)`,
          }}
        />
      ))}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 60%, rgba(255,200,90,${0.5 * key}) 0%, rgba(0,0,0,0) 55%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 640,
          width: 700,
          height: 933,
        }}
      >
        <Student
          glow={off}
          screenOn={off}
          lids={interpolate(key, [0, 1], [0.55, 0.1])}
          smile={key * 0.6}
          keyGlow={key}
        />
      </div>
    </AbsoluteFill>
  );
};

const Campus: React.FC<{ local: number; dur: number }> = ({ local, dur }) => {
  const z = interpolate(local, [0, dur], [1.08, 1.0]);
  const tips = [
    "Silencia las notificaciones",
    "Ponte un horario",
    "Mira a tu alrededor",
  ];
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg,#7ec8ff 0%,#cfefff 55%,#e9f5e1 100%)",
        transform: `scale(${z})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 120,
          width: 170,
          height: 170,
          borderRadius: 85,
          background: "#ffd166",
          boxShadow: "0 0 90px #ffd166",
        }}
      />
      {/* building */}
      <AbsoluteFill style={{ filter: "blur(3px)" }}>
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 520,
            width: 960,
            height: 760,
            background: "#e6e9ef",
            borderRadius: 12,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 500,
            width: 960,
            height: 40,
            background: "#1d2733",
          }}
        />
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 110 + (i % 6) * 150,
              top: 640 + Math.floor(i / 6) * 150,
              width: 110,
              height: 100,
              background: "linear-gradient(135deg,#8ecae6,#3d5a80)",
              borderRadius: 6,
            }}
          />
        ))}
        {[40, 900].map((x) => (
          <div
            key={x}
            style={{
              position: "absolute",
              left: x,
              top: 980,
              width: 200,
              height: 260,
              borderRadius: 100,
              background: "#52b788",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1280,
            height: 640,
            background: "#95d5b2",
          }}
        />
      </AbsoluteFill>
      {/* banner with the university logo */}
      <div
        style={{
          position: "absolute",
          left: 290,
          top: 540,
          width: 500,
          height: 240,
          background: "white",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <Img src={staticFile("rs/logo.png")} style={{ width: 440 }} />
      </div>
      {/* friends */}
      {[
        { x: -20, c: "#e76f51", s: "#8d5524" },
        { x: 640, c: "#2a9d8f", s: "#c68642" },
      ].map((f, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: f.x,
            top: 1140,
            width: 460,
            height: 613,
            filter: "blur(2px)",
          }}
        >
          <Student
            phone={false}
            smile={1}
            lids={0.1}
            hoodie={f.c}
            skin={f.s}
            glow={0}
          />
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 240,
          top: 1000,
          width: 600,
          height: 800,
        }}
      >
        <Student
          phone={false}
          books
          smile={1}
          lids={0.05}
          hoodie="#3b5b6e"
          glow={0}
        />
      </div>
      {tips.map((t, i) => {
        const p = spring({
          frame: local - 25 - i * 45,
          fps: FPS,
          config: { damping: 14 },
        });
        return (
          <div
            key={t}
            style={{
              position: "absolute",
              left: 90,
              top: 200 + i * 105,
              transform: `translateX(${(1 - p) * -700}px)`,
              opacity: p,
              background: "rgba(13,27,42,0.85)",
              color: "white",
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 42,
              padding: "16px 30px",
              borderRadius: 50,
              borderLeft: `12px solid ${YELLOW}`,
            }}
          >
            {t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const End: React.FC<{ local: number }> = ({ local }) => {
  const a = spring({ frame: local, fps: FPS, config: { damping: 16 } });
  const b = spring({ frame: local - 20, fps: FPS, config: { damping: 12 } });
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #1d3557 0%, #0b0f1a 75%)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 24,
          padding: "26px 40px",
          transform: `scale(${a})`,
          marginBottom: 120,
        }}
      >
        <Img src={staticFile("rs/logo.png")} style={{ width: 520 }} />
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 104,
          color: "white",
          transform: `translateY(${(1 - b) * 60}px)`,
          opacity: b,
          letterSpacing: 2,
        }}
      >
        DESCONÉCTATE
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 92,
          color: YELLOW,
          transform: `translateY(${(1 - b) * 60}px)`,
          opacity: b,
        }}
      >
        para conectar
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 40,
          color: "#a8dadc",
          marginTop: 60,
          opacity: b,
        }}
      >
        #DesconéctateParaConectar
      </div>
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------- scene switcher
const renderScene = (id: string, local: number, dur: number) => {
  switch (id) {
    case "eyes":
      return <Eyes />;
    case "room":
      return <Room local={local} dur={dur} />;
    case "timelapse":
      return <Timelapse local={local} dur={dur} />;
    case "notifs":
      return <Notifs local={local} dur={dur} />;
    case "cage":
      return (
        <>
          <Notifs
            local={local + 360}
            dur={dur}
            cage={interpolate(local, [0, 60], [0, 1], clamp)}
          />
          <GlitchWords local={local - sec(53 - 46)} />
        </>
      );
    case "turn":
      return <Turn local={local} />;
    case "campus":
      return <Campus local={local} dur={dur} />;
    default:
      return <End local={local} />;
  }
};

const Scenes: React.FC = () => {
  const frame = useCurrentFrame();
  const i = RS.scenes.findIndex((s) => frame >= s.from && frame < s.to);
  const s = RS.scenes[Math.max(0, i)];
  const cur = (
    <SceneFrame>{renderScene(s.id, frame - s.from, s.to - s.from)}</SceneFrame>
  );
  // Whip pan into the campus: both scenes slide fast with motion blur.
  const WHIP = sec(66);
  const wp = interpolate(frame, [WHIP - 8, WHIP + 8], [0, 1], clamp);
  if (wp > 0 && wp < 1) {
    const prev = RS.scenes.find((x) => x.id === "turn")!;
    const next = RS.scenes.find((x) => x.id === "campus")!;
    const e = Easing.inOut(Easing.cubic)(wp);
    return (
      <AbsoluteFill
        style={{ filter: `blur(${Math.sin(wp * Math.PI) * 28}px)` }}
      >
        <AbsoluteFill style={{ transform: `translateX(${-e * W}px)` }}>
          {renderScene("turn", frame - prev.from, prev.to - prev.from)}
        </AbsoluteFill>
        <AbsoluteFill style={{ transform: `translateX(${(1 - e) * W}px)` }}>
          {renderScene("campus", frame - next.from, next.to - next.from)}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return cur;
};

const SceneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>{children}</AbsoluteFill>
);

// Digital glitch around scene changes (RGB split, sliced offsets, noise bars).
const GLITCH_AT = [sec(7), sec(20), sec(34), sec(46), sec(60), sec(80)];
const Glitch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const near = GLITCH_AT.find((g) => Math.abs(frame - g) <= 6);
  const inCage =
    frame > sec(46) &&
    frame < sec(60) &&
    random(`c${Math.floor(frame / 3)}`) > 0.86;
  if (near === undefined && !inCage) return <>{children}</>;
  const amt = near !== undefined ? 1 - Math.abs(frame - near) / 7 : 0.5;
  const r = (k: string) => (random(`${k}${frame}`) - 0.5) * 2;
  return (
    <AbsoluteFill>
      {children}
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: 0.6 * amt,
          transform: `translateX(${18 * amt}px)`,
          filter: "sepia(1) saturate(9) hue-rotate(-50deg)",
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: 0.6 * amt,
          transform: `translateX(${-18 * amt}px)`,
          filter: "sepia(1) saturate(9) hue-rotate(150deg)",
        }}
      >
        {children}
      </AbsoluteFill>
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
      {[0, 1, 2].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${Math.abs(r(`n${k}`)) * 100}%`,
            height: 6 + Math.abs(r(`h${k}`)) * 20,
            background: k % 2 ? "#00f5d4" : "#ff006e",
            opacity: 0.5 * amt,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Warm study tones -> cold digital blue -> warm again after the turn.
const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const c = interpolateColors(
    frame,
    [0, sec(8), sec(30), sec(46), sec(60), sec(64), sec(90)],
    [
      "#ff9f43",
      "#ff9f43",
      "#2e86de",
      "#1e3799",
      "#1e3799",
      "#ffb142",
      "#ffb142",
    ],
  );
  return (
    <>
      <AbsoluteFill
        style={{ background: c, mixBlendMode: "soft-light", opacity: 0.45 }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </>
  );
};

// Captions in the reference style: small tight sans words, the key word in a
// big neon script (yellow / red), and punch words in red condensed caps.
const SANS = "Inter, sans-serif";
const SCRIPT = "'Great Vibes', cursive";
const CAPS = "Anton, sans-serif";
const neon = (c: string) =>
  `0 0 6px ${c}, 0 0 18px ${c}, 0 0 42px ${c}, 0 4px 10px rgba(0,0,0,0.6)`;

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const ci = RS.captions.findIndex((c) => frame >= c.from && frame < c.to);
  if (ci < 0) return null;
  const cap = RS.captions[ci];
  const neonColor = ci % 2 ? "#ff2d3d" : "#ffe14d";
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 68%, rgba(0,0,0,0.6) 88%, rgba(0,0,0,0) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          top: 1250,
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
          const p = spring({
            frame: frame - w.t,
            fps: FPS,
            config: { damping: 14 },
          });
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
                  fontSize: 190,
                  lineHeight: 0.9,
                  color: neonColor,
                  textShadow: neon(neonColor),
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
                  color: "#e5121b",
                  textTransform: "uppercase",
                  textShadow: "0 6px 24px rgba(0,0,0,0.7)",
                  letterSpacing: -2,
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

export const RedesJaula: React.FC = () => {
  const musicVolume = (f: number) => {
    const speaking = RS.captions.some((c) => f >= c.from - 6 && f < c.to + 6);
    const fadeOut = interpolate(
      f,
      [RS.duration - 60, RS.duration],
      [1, 0],
      clamp,
    );
    return (
      (speaking ? 0.3 : 0.6) * interpolate(f, [0, 15], [0, 1], clamp) * fadeOut
    );
  };
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Glitch>
        <Scenes />
      </Glitch>
      <Grade />
      <Captions />
      <Audio src={staticFile("rs/musica.wav")} volume={musicVolume} />
      {RS.voice.map((v, i) => (
        <Sequence key={i} from={v.from}>
          <Audio src={staticFile(v.src)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
