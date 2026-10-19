import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Backdrop } from "./Backdrop";
import { BODY, C, HEAD } from "./theme";

// YouTube thumbnail (1280x720) using a frame from the Moro reflex clip.
export const Thumbnail: React.FC<{
  readonly image: string;
  readonly line1: string;
  readonly line2: string;
  readonly badge: string;
}> = ({ image, line1, line2, badge }) => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <Img
        src={staticFile(image)}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          height: "100%",
          width: 760,
          objectFit: "cover",
          maskImage: "linear-gradient(90deg, transparent 0%, black 30%)",
        }}
      />
      <div style={{ position: "absolute", left: 60, top: 120, width: 700 }}>
        <div
          style={{
            display: "inline-block",
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 30,
            color: C.bgBottom,
            background: C.mint,
            borderRadius: 999,
            padding: "8px 22px",
          }}
        >
          {badge}
        </div>
        <div
          style={{
            fontFamily: HEAD,
            fontWeight: 800,
            fontSize: 118,
            lineHeight: 0.95,
            color: C.text,
            marginTop: 24,
            textShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          {line1}
        </div>
        <div
          style={{
            fontFamily: HEAD,
            fontWeight: 800,
            fontSize: 84,
            lineHeight: 1,
            color: C.peach,
            marginTop: 10,
          }}
        >
          {line2}
        </div>
      </div>
    </AbsoluteFill>
  );
};
