import React from "react";
import {
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Still images with slow push-in and crossfades, used where the source video is damaged.
const SlideshowInner: React.FC<{
  readonly images: string[];
  readonly style?: React.CSSProperties;
}> = ({ images, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const per = durationInFrames / images.length;
  const fadeFrames = 1 * fps;
  return (
    <div style={{ overflow: "hidden", ...style }}>
      {images.map((src, i) => {
        const start = i * per;
        const local = frame - start;
        return (
          <Img
            key={src}
            src={staticFile(src)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: interpolate(
                local,
                [-fadeFrames, 0, per, per + fadeFrames],
                [0, 1, 1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
              scale: interpolate(
                local,
                [-fadeFrames, per + fadeFrames],
                [1, 1.12],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              translate: `${interpolate(
                local,
                [-fadeFrames, per + fadeFrames],
                i % 2 ? [-20, 20] : [20, -20],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              )}px 0px`,
            }}
          />
        );
      })}
    </div>
  );
};

export const Slideshow = Interactive.create({
  Component: SlideshowInner,
  layout: "none",
  schema: {},
});
