import React from "react";
import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop } from "./Backdrop";
import { BODY, C, HEAD } from "./theme";

const OutroSceneInner: React.FC<{
  readonly primitive: string[];
  readonly postural: string[];
  readonly closing: string;
}> = ({ primitive, postural, closing }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const col = (title: string, list: string[], color: string, delay: number) => (
    <div style={{ width: 760 }}>
      <div
        style={{
          fontFamily: HEAD,
          fontWeight: 700,
          fontSize: 40,
          color,
          marginBottom: 18,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {list.map((r, i) => (
          <div
            key={r}
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 28,
              color: C.text,
              padding: "10px 20px",
              borderRadius: 999,
              background: C.card,
              border: `1px solid ${C.cardBorder}`,
              opacity: interpolate(
                frame,
                [delay + i * 3, delay + i * 3 + 10],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              scale: interpolate(
                frame,
                [delay + i * 3, delay + i * 3 + 14],
                [0.8, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          >
            {r}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <>
      <Backdrop />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
        }}
      >
        <div
          style={{
            fontFamily: HEAD,
            fontWeight: 800,
            fontSize: 84,
            color: C.text,
            opacity: interpolate(frame, [0, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Resumen
        </div>
        <div style={{ display: "flex", gap: 80 }}>
          {col("Reflejos primitivos", primitive, C.mint, 10)}
          {col(
            "Reacciones posturales",
            postural,
            C.peach,
            10 + primitive.length * 3,
          )}
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 40,
            color: C.muted,
            opacity: interpolate(frame, [3 * fps, 3.6 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {closing}
        </div>
      </div>
    </>
  );
};

export const OutroScene = Interactive.create({
  Component: OutroSceneInner,
  layout: "absolute-fill",
  schema: {
    closing: { type: "string", default: "", description: "Mensaje final" },
  },
});
