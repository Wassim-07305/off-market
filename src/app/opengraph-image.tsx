import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Off Market — Plateforme de coaching business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090B",
          gap: "24px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://off-market-amber.vercel.app/logo.png"
          width={160}
          height={160}
          alt=""
          style={{ borderRadius: "32px" }}
        />
        <div
          style={{
            fontSize: 64,
            color: "white",
            fontFamily: "serif",
          }}
        >
          Off Market
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#a1a1aa",
          }}
        >
          Plateforme de coaching business tout-en-un
        </div>
      </div>
    ),
    { ...size }
  );
}
