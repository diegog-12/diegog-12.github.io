import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import "@fontsource/montserrat/900-italic.css";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BLUE = "#1b3a8c";
const BLUE_DARK = "#10255f";
const RED = "#c8102e";
const FONT = "Montserrat, sans-serif";

const POSTER = staticFile("poster.jpg");
const POSTER_W = 1024;
const POSTER_H = 1536;
const WIDTH = 1080;
const SCALE = WIDTH / POSTER_W;

// Region of the poster, in poster pixels.
type Rect = { x: number; y: number; w: number; h: number };

// Shows one rectangular region of the poster at its original place,
// given the poster's top offset on the canvas.
const PosterPiece: React.FC<{
  rect: Rect;
  top: number;
  style?: React.CSSProperties;
}> = ({ rect, top, style }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x * SCALE,
        top: top + rect.y * SCALE,
        width: rect.w * SCALE,
        height: rect.h * SCALE,
        overflow: "hidden",
        ...style,
      }}
    >
      <Img
        src={POSTER}
        style={{
          position: "absolute",
          left: -rect.x * SCALE,
          top: -rect.y * SCALE,
          width: POSTER_W * SCALE,
          height: POSTER_H * SCALE,
          maxWidth: "none", // Tailwind preflight would shrink it to the piece
        }}
      />
    </div>
  );
};

// "¡VUELVE EL RURAL TOUR!" banner. `progress` goes 0 → 1 to animate it in.
const Header: React.FC<{ height: number; progress?: number }> = ({
  height,
  progress = 1,
}) => {
  const small = height * 0.2;
  const big = height * 0.4;
  const slide = interpolate(progress, [0, 1], [-WIDTH, 0]);
  const pop = interpolate(progress, [0.4, 1], [0.6, 1], {
    extrapolateLeft: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: WIDTH,
        height,
        background: `linear-gradient(135deg, ${BLUE_DARK} 0%, ${BLUE} 60%, ${BLUE_DARK} 100%)`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -60,
          top: 0,
          width: 260,
          height: "100%",
          background: RED,
          transform: "skewX(-20deg)",
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: height * 0.05,
          background: RED,
        }}
      />
      <div
        style={{
          color: "white",
          fontWeight: 800,
          fontSize: small,
          letterSpacing: small * 0.12,
          transform: `translateX(${slide}px)`,
          lineHeight: 1.1,
        }}
      >
        ¡VUELVE EL
      </div>
      <div
        style={{
          color: "white",
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: big,
          lineHeight: 1.05,
          transform: `scale(${pop})`,
          opacity: interpolate(progress, [0.3, 0.6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          textShadow: `${big * 0.06}px ${big * 0.06}px 0 ${RED}`,
        }}
      >
        RURAL TOUR!
      </div>
    </div>
  );
};

// Opción 1: transparent frame. The concert clip (1080x608) is composited
// into the hole below the header with ffmpeg.
export const OVERLAY_HEADER_H = 200;
export const OVERLAY_VIDEO_H = 608;
const OVERLAY_POSTER_Y0 = 482; // poster row where the bottom part starts

export const CampaignOverlay: React.FC = () => {
  const posterTop =
    OVERLAY_HEADER_H + OVERLAY_VIDEO_H - OVERLAY_POSTER_Y0 * SCALE;
  return (
    <AbsoluteFill>
      <PosterPiece
        rect={{
          x: 0,
          y: OVERLAY_POSTER_Y0,
          w: POSTER_W,
          h: POSTER_H - OVERLAY_POSTER_Y0,
        }}
        top={posterTop}
      />
      <Header height={OVERLAY_HEADER_H} />
    </AbsoluteFill>
  );
};

// Opción 2: animated promo built only from the poster.
const PROMO_HEADER_H = 300;

const LOGO: Rect = { x: 320, y: 40, w: 400, h: 365 };
const SLOGAN: Rect = { x: 395, y: 420, w: 230, h: 220 };
const ANGEL: Rect = { x: 0, y: 525, w: 505, h: 785 };
const JAMES: Rect = { x: 505, y: 560, w: 519, h: 730 };
const FOOTER: Rect = { x: 0, y: 1290, w: 1024, h: 246 };

export const CampaignPromo: React.FC<{ fadeOut?: boolean }> = ({
  fadeOut: withFadeOut = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = (delay: number, damping = 14) =>
    spring({ frame: frame - delay, fps, config: { damping } });

  const header = enter(0, 18);
  const logo = enter(20);
  const angel = enter(40);
  const james = enter(55);
  const slogan = enter(75, 10);
  const footer = enter(95);

  // Slow push-in over the whole video, and a fade out at the end.
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06], {
    easing: Easing.inOut(Easing.quad),
  });
  const fadeOut = withFadeOut
    ? interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
      })
    : 1;
  const pulse = 1 + 0.03 * Math.sin((frame / fps) * Math.PI * 2);

  // Base: the full poster with the animated regions blanked out.
  const blank = (r: Rect) => (
    <div
      style={{
        position: "absolute",
        left: r.x * SCALE,
        top: PROMO_HEADER_H + r.y * SCALE,
        width: r.w * SCALE,
        height: r.h * SCALE,
        background: "white",
      }}
    />
  );

  return (
    <AbsoluteFill style={{ background: "white", opacity: fadeOut }}>
      <AbsoluteFill
        style={{ transform: `scale(${zoom})`, transformOrigin: "50% 60%" }}
      >
        <div style={{ opacity: interpolate(frame, [0, 15], [0, 1]) }}>
          <PosterPiece
            rect={{ x: 0, y: 0, w: POSTER_W, h: POSTER_H }}
            top={PROMO_HEADER_H}
          />
          {blank(LOGO)}
          {blank(SLOGAN)}
          {blank(ANGEL)}
          {blank(JAMES)}
          {blank(FOOTER)}
        </div>
        <PosterPiece
          rect={LOGO}
          top={PROMO_HEADER_H}
          style={{
            opacity: logo,
            transform: `scale(${interpolate(logo, [0, 1], [0.4, 1])})`,
          }}
        />
        <PosterPiece
          rect={ANGEL}
          top={PROMO_HEADER_H}
          style={{
            transform: `translateX(${interpolate(angel, [0, 1], [-600, 0])}px)`,
          }}
        />
        <PosterPiece
          rect={JAMES}
          top={PROMO_HEADER_H}
          style={{
            transform: `translateX(${interpolate(james, [0, 1], [600, 0])}px)`,
          }}
        />
        <PosterPiece
          rect={SLOGAN}
          top={PROMO_HEADER_H}
          style={{
            opacity: slogan,
            transform: `scale(${interpolate(slogan, [0, 1], [0, 1]) * (frame > 110 ? pulse : 1)})`,
          }}
        />
        <PosterPiece
          rect={FOOTER}
          top={PROMO_HEADER_H}
          style={{
            transform: `translateY(${interpolate(footer, [0, 1], [300, 0])}px)`,
          }}
        />
      </AbsoluteFill>
      <Header height={PROMO_HEADER_H} progress={header} />
    </AbsoluteFill>
  );
};
