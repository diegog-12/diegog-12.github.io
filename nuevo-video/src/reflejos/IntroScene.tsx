import { Circle } from "@remotion/shapes";
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

const IntroSceneInner: React.FC<{
  readonly title: string;
  readonly subtitle: string;
  readonly tagline: string;
}> = ({ title, subtitle, tagline }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const out = interpolate(
    frame,
    [durationInFrames - 0.6 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <>
      <Backdrop />
      {[0, 1, 2].map((i) => (
        <Circle
          key={i}
          radius={260 + i * 150}
          fill="transparent"
          stroke={i === 1 ? C.peach : C.mint}
          strokeWidth={2}
          style={{
            position: "absolute",
            left: 960 - (260 + i * 150),
            top: 540 - (260 + i * 150),
            opacity: interpolate(frame, [i * 6, 20 + i * 6], [0, 0.25], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [i * 6, 40 + i * 6], [0.6, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: out,
        }}
      >
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: 10,
            color: C.mint,
            textTransform: "uppercase",
            opacity: interpolate(frame, [10, 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            fontFamily: HEAD,
            fontWeight: 800,
            fontSize: 132,
            color: C.text,
            marginTop: 18,
            lineHeight: 1.05,
            textAlign: "center",
            translate: `0px ${interpolate(frame, [15, 45], [40, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}px`,
            opacity: interpolate(frame, [15, 40], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: interpolate(frame, [40, 70], [0, 420], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${C.mint}, ${C.peach})`,
            marginTop: 30,
          }}
        />
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 500,
            fontSize: 44,
            color: C.muted,
            marginTop: 30,
            opacity: interpolate(frame, [55, 80], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {subtitle}
        </div>
      </div>
    </>
  );
};

export const IntroScene = Interactive.create({
  Component: IntroSceneInner,
  layout: "absolute-fill",
  schema: {
    title: { type: "string", default: "", description: "Título" },
    subtitle: { type: "string", default: "", description: "Subtítulo" },
    tagline: { type: "string", default: "", description: "Antetítulo" },
  },
});
