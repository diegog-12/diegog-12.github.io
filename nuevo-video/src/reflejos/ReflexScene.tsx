import React from "react";
import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop } from "./Backdrop";
import { BODY, C, FRAME, HEAD } from "./theme";

type Props = {
  readonly section: string;
  readonly counter: string;
  readonly title: string;
  readonly alias: string;
  readonly stimulus: string;
  readonly response: string;
  readonly note: string;
  readonly stimulusAt: number; // seconds into the clip
  readonly responseAt: number;
  readonly phases: string[];
  readonly phaseAt: number[];
  readonly replayFrom: number; // seconds; < 0 = none
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const Card: React.FC<{
  readonly label: string;
  readonly text: string;
  readonly color: string;
  readonly at: number;
}> = ({ label, text, color, at }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 20,
        padding: "22px 26px",
        opacity: interpolate(frame, [at, at + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: `0px ${interpolate(frame, [at, at + 18], [30, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        })}px`,
      }}
    >
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 4,
          color,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 500,
          fontSize: 32,
          lineHeight: 1.3,
          color: C.text,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const ReflexSceneInner: React.FC<Props> = ({
  section,
  counter,
  title,
  alias,
  stimulus,
  response,
  note,
  stimulusAt,
  responseAt,
  phases,
  phaseAt,
  replayFrom,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const active = phaseAt.reduce((acc, at, i) => (t >= at ? i : acc), -1);
  const progress = frame / durationInFrames;
  return (
    <>
      <Backdrop />
      {/* top bar */}
      <div
        style={{
          position: "absolute",
          left: FRAME.left,
          right: 90,
          top: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 26,
          color: C.muted,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        <span>
          <span style={{ color: C.mint }}>●</span> {section}
        </span>
        <span>{counter}</span>
      </div>
      {/* frame shadow + border behind the video */}
      <div
        style={{
          position: "absolute",
          left: FRAME.left - 8,
          top: FRAME.top - 8,
          width: FRAME.width + 16,
          height: FRAME.height + 16,
          borderRadius: 30,
          background: "rgba(0,0,0,0.35)",
          border: `2px solid ${C.cardBorder}`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        }}
      />
      {/* clip progress bar */}
      <div
        style={{
          position: "absolute",
          left: FRAME.left,
          top: FRAME.top + FRAME.height + 22,
          width: FRAME.width,
          height: 6,
          borderRadius: 3,
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            borderRadius: 3,
            background: `linear-gradient(90deg, ${C.mint}, ${C.peach})`,
          }}
        />
      </div>
      {replayFrom >= 0 && t >= replayFrom ? (
        <div
          style={{
            position: "absolute",
            left: FRAME.left + 24,
            top: FRAME.top + 24,
            zIndex: 5,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 24,
            color: C.text,
            background: "rgba(0,0,0,0.55)",
            borderRadius: 999,
            padding: "8px 18px",
          }}
        >
          Imágenes de referencia · video original dañado
        </div>
      ) : null}
      {/* side panel */}
      <div
        style={{
          position: "absolute",
          left: FRAME.left + FRAME.width + 60,
          right: 90,
          top: FRAME.top - 8,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            opacity: interpolate(frame, [0, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: `${interpolate(frame, [0, 20], [40, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            })}px 0px`,
          }}
        >
          <div
            style={{
              fontFamily: HEAD,
              fontWeight: 800,
              fontSize: 62,
              lineHeight: 1.05,
              color: C.text,
            }}
          >
            {title}
          </div>
          {alias ? (
            <div
              style={{
                fontFamily: BODY,
                fontWeight: 500,
                fontSize: 28,
                color: C.peach,
                marginTop: 8,
              }}
            >
              {alias}
            </div>
          ) : null}
        </div>
        {stimulus ? (
          <Card
            label="Estímulo"
            text={stimulus}
            color={C.mint}
            at={stimulusAt * fps}
          />
        ) : null}
        {response ? (
          <Card
            label="Respuesta"
            text={response}
            color={C.peach}
            at={responseAt * fps}
          />
        ) : null}
        {phases.length > 0 ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {phases.map((p, i) => (
              <div
                key={p}
                style={{
                  fontFamily: BODY,
                  fontWeight: 700,
                  fontSize: 26,
                  padding: "10px 18px",
                  borderRadius: 999,
                  color: i === active ? C.bgBottom : C.muted,
                  background: i === active ? C.mint : "rgba(255,255,255,0.06)",
                  border: `1px solid ${i === active ? C.mint : C.cardBorder}`,
                  scale: i === active ? 1.06 : 1,
                }}
              >
                {p}
              </div>
            ))}
          </div>
        ) : null}
        {note ? (
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 500,
              fontSize: 24,
              lineHeight: 1.35,
              color: C.muted,
              opacity: interpolate(frame, [20, 35], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {note}
          </div>
        ) : null}
      </div>
    </>
  );
};

export const ReflexScene = Interactive.create({
  Component: ReflexSceneInner,
  layout: "absolute-fill",
  schema: {
    title: { type: "string", default: "", description: "Reflejo" },
    alias: { type: "string", default: "", description: "Otro nombre" },
    stimulus: { type: "string", default: "", description: "Estímulo" },
    response: { type: "string", default: "", description: "Respuesta" },
    note: { type: "string", default: "", description: "Nota" },
    stimulusAt: {
      type: "number",
      default: 1,
      min: 0,
      step: 0.1,
      description: "Estímulo aparece (s)",
      hiddenFromList: false,
    },
    responseAt: {
      type: "number",
      default: 5,
      min: 0,
      step: 0.1,
      description: "Respuesta aparece (s)",
      hiddenFromList: false,
    },
  },
});
