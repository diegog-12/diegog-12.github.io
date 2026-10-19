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

const ChapterSceneInner: React.FC<{
  readonly part: string;
  readonly title: string;
  readonly items: string[];
}> = ({ part, title, items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Backdrop />
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 0,
          bottom: 0,
          width: 900,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: HEAD,
            fontWeight: 800,
            fontSize: 260,
            lineHeight: 0.9,
            color: "transparent",
            WebkitTextStroke: `3px ${C.mint}`,
            opacity: interpolate(frame, [0, 0.5 * fps], [0, 0.9], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {part}
        </div>
        <div
          style={{
            fontFamily: HEAD,
            fontWeight: 800,
            fontSize: 96,
            lineHeight: 1.05,
            color: C.text,
            marginTop: 20,
            translate: `${interpolate(frame, [0.2 * fps, 0.9 * fps], [-60, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}px 0px`,
            opacity: interpolate(frame, [0.2 * fps, 0.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 160,
          top: 0,
          bottom: 0,
          width: 640,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 14,
        }}
      >
        {items.map((it, i) => (
          <div
            key={it}
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 36,
              color: C.text,
              background: C.card,
              border: `1px solid ${C.cardBorder}`,
              borderLeft: `6px solid ${i % 2 ? C.peach : C.mint}`,
              borderRadius: 14,
              padding: "12px 24px",
              opacity: interpolate(
                frame,
                [0.6 * fps + i * 4, 0.6 * fps + i * 4 + 12],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
              translate: `${interpolate(
                frame,
                [0.6 * fps + i * 4, 0.6 * fps + i * 4 + 18],
                [80, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              )}px 0px`,
            }}
          >
            <span style={{ color: C.muted, marginRight: 16 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            {it}
          </div>
        ))}
      </div>
    </>
  );
};

export const ChapterScene = Interactive.create({
  Component: ChapterSceneInner,
  layout: "absolute-fill",
  schema: {
    part: { type: "string", default: "01", description: "Número de parte" },
    title: { type: "string", default: "", description: "Título" },
  },
});
