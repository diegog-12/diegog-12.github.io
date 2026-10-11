import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/playfair-display/700-italic.css";
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
  useVideoConfig,
} from "remotion";
import { EDU } from "./eduData";

const SANS = "Montserrat, sans-serif";
const SERIF = "'Playfair Display', serif";
const GOLD = "#f3c969";

// Cinematic grade applied to every shot.
const GRADE = "contrast(1.12) saturate(0.88) brightness(0.95) sepia(0.08)";

type Shot = (typeof EDU.shots)[number];

const Media: React.FC<{ shot: Shot; style: React.CSSProperties }> = ({
  shot,
  style,
}) => {
  if (shot.kind === "video") {
    return (
      <OffthreadVideo
        src={staticFile(shot.src)}
        startFrom={Math.round(shot.offset * 30)}
        muted
        style={style}
      />
    );
  }
  return <Img src={staticFile(shot.src)} style={style} />;
};

// One shot: slow push-in (Ken Burns), fade in/out, graded.
const ShotView: React.FC<{ shot: Shot; index: number }> = ({ shot, index }) => {
  const frame = useCurrentFrame();
  const d = shot.dur;
  const zoomIn = index % 2 === 0;
  const scale = interpolate(frame, [0, d], zoomIn ? [1.04, 1.16] : [1.16, 1.04], {
    easing: Easing.inOut(Easing.sin),
  });
  const drift = interpolate(frame, [0, d], [-1.5, 1.5]) * (index % 3 === 0 ? 1 : -1);
  const opacity = interpolate(frame, [0, 10, d - 10, d], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fill: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    maxWidth: "none",
  };

  if (shot.mode === "crest") {
    // School crest over a dark, softly lit background.
    const pop = spring({ frame: frame - 6, fps: 30, config: { damping: 14 } });
    return (
      <AbsoluteFill
        style={{
          opacity,
          background:
            "radial-gradient(circle at 50% 45%, #2b3a4a 0%, #0b0f14 70%)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={staticFile(shot.src)}
          style={{
            width: 520,
            borderRadius: 24,
            transform: `scale(${0.7 + 0.3 * pop})`,
            opacity: pop,
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          }}
        />
        <div
          style={{
            marginTop: 50,
            fontFamily: SANS,
            fontWeight: 800,
            color: "white",
            fontSize: 44,
            letterSpacing: 6,
            opacity: pop,
          }}
        >
          I.E.I. CORPACANCHA
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            color: GOLD,
            fontSize: 56,
            opacity: pop,
          }}
        >
          N.º 64556
        </div>
      </AbsoluteFill>
    );
  }

  const transform = `scale(${scale}) translateX(${drift}%)`;
  if (shot.mode === "contain") {
    // Wide group photos: blurred fill behind the full picture.
    return (
      <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
        <Media
          shot={shot}
          style={{
            ...fill,
            objectFit: "cover",
            filter: `blur(40px) ${GRADE} brightness(0.6)`,
            transform: "scale(1.2)",
          }}
        />
        <AbsoluteFill style={{ justifyContent: "center" }}>
          <Media
            shot={shot}
            style={{
              width: "100%",
              maxWidth: "none",
              filter: GRADE,
              transform,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <Media
        shot={shot}
        style={{
          ...fill,
          objectFit: "cover",
          objectPosition: `${shot.fx}% 50%`,
          filter: GRADE,
          transform,
        }}
      />
    </AbsoluteFill>
  );
};

// Teal shadows / warm highlights, vignette and animated film grain.
const Look: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,40,60,0.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 60%, rgba(60,30,0,0.25) 100%)",
          mixBlendMode: "soft-light",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      <AbsoluteFill style={{ opacity: 0.09, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              seed={frame % 12}
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

// Word-by-word captions; key words in gold serif italic, larger.
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const cap = EDU.captions.find((c) => frame >= c.from && frame < c.to);
  if (!cap) return null;
  return (
    <AbsoluteFill
      style={{
        top: 1180,
        height: 400,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        alignContent: "center",
        padding: "0 70px",
        gap: "0 22px",
      }}
    >
      {cap.words.map((w, i) => {
        const p = spring({ frame: frame - w.t, fps: 30, config: { damping: 16 } });
        if (frame < w.t) return null;
        return (
          <span
            key={i}
            style={{
              fontFamily: w.em ? SERIF : SANS,
              fontStyle: w.em ? "italic" : "normal",
              fontWeight: w.em ? 700 : 700,
              fontSize: w.em ? 104 : 58,
              color: w.em ? GOLD : "white",
              textShadow: "0 4px 24px rgba(0,0,0,0.7)",
              opacity: p,
              transform: `translateY(${(1 - p) * 30}px)`,
              display: "inline-block",
              lineHeight: 1.15,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </AbsoluteFill>
  );
};

// Opening title over the first shot.
const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const a = spring({ frame: frame - 8, fps: 30, config: { damping: 18 } });
  const out = interpolate(frame, [95, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        top: 330,
        height: 400,
        alignItems: "center",
        opacity: out,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          color: "white",
          fontSize: 40,
          letterSpacing: 14,
          opacity: a,
        }}
      >
        EDUCACIÓN
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 700,
          color: GOLD,
          fontSize: 150,
          lineHeight: 1,
          opacity: a,
          transform: `scale(${0.85 + 0.15 * a})`,
          textShadow: "0 6px 40px rgba(0,0,0,0.6)",
        }}
      >
        Rural
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          color: "white",
          fontSize: 30,
          letterSpacing: 10,
          marginTop: 10,
          opacity: a * 0.9,
        }}
      >
        PERÚ
      </div>
    </AbsoluteFill>
  );
};

// Closing card: crest + call to share.
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const a = spring({ frame, fps: 30, config: { damping: 16 } });
  return (
    <AbsoluteFill
      style={{
        background: `rgba(8,10,14,${0.75 * a})`,
        alignItems: "center",
        justifyContent: "center",
        opacity: a,
      }}
    >
      <Img
        src={staticFile("edu/p02.jpg")}
        style={{ width: 300, borderRadius: 18, transform: `scale(${0.8 + 0.2 * a})` }}
      />
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 700,
          color: GOLD,
          fontSize: 92,
          marginTop: 50,
          textAlign: "center",
          lineHeight: 1.05,
        }}
      >
        La educación
        <br />
        cambia vidas
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          color: "white",
          fontSize: 38,
          letterSpacing: 6,
          marginTop: 40,
        }}
      >
        COMPARTE ESTE VIDEO
      </div>
    </AbsoluteFill>
  );
};

export const EduRural: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const voiceFrames = EDU.voice.map((v) => v.from);
  // Music: ducked under the voice, swells at the start and in the end card.
  const musicVolume = (f: number) => {
    const speaking = EDU.captions.some((c) => f >= c.from - 6 && f < c.to + 6);
    const base = speaking ? 0.22 : 0.5;
    const fadeIn = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(f, [durationInFrames - 60, durationInFrames], [1, 0], {
      extrapolateLeft: "clamp",
    });
    return base * fadeIn * fadeOut;
  };
  return (
    <AbsoluteFill style={{ background: "black" }}>
      {EDU.shots.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur}>
          <ShotView shot={s} index={i} />
        </Sequence>
      ))}
      <Look />
      <Sequence durationInFrames={130}>
        <Title />
      </Sequence>
      <Captions />
      <Sequence from={EDU.endCard}>
        <EndCard />
      </Sequence>
      <Audio src={staticFile("edu/musica.wav")} volume={musicVolume} />
      {EDU.voice.map((v, i) => (
        <Sequence key={i} from={voiceFrames[i]}>
          <Audio src={staticFile(v.src)} volume={1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
