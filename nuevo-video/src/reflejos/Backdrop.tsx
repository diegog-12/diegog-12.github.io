import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "./theme";

// Soft animated gradient with slow drifting light blobs.
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${C.bgTop} 0%, ${C.bgBottom} 100%)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.mint}22 0%, transparent 70%)`,
          translate: `${interpolate(frame % 1800, [0, 900, 1800], [-200, 100, -200])}px ${interpolate(frame % 2400, [0, 1200, 2400], [-300, -150, -300])}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -250,
          bottom: -300,
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.peach}1a 0%, transparent 70%)`,
          translate: `${interpolate(frame % 2100, [0, 1050, 2100], [0, -150, 0])}px 0px`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
    </AbsoluteFill>
  );
};
