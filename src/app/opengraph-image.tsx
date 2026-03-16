import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Off Market — Deviens le choix evident";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
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
        src={new URL(
          "/logo.png",
          process.env.NEXT_PUBLIC_APP_URL ?? "https://app.offmarket.fr",
        ).toString()}
        width={160}
        height={160}
        alt=""
        style={{ borderRadius: "32px" }}
      />
      <div
        style={{
          fontSize: 64,
          color: "white",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        Off Market
      </div>
      <div
        style={{
          fontSize: 28,
          color: "#DC2626",
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        Deviens le choix evident.
      </div>
      <div
        style={{
          fontSize: 20,
          color: "#a1a1aa",
          marginTop: "4px",
        }}
      >
        Formation · Coaching prive · Communaute · 10K/mois
      </div>
    </div>,
    { ...size },
  );
}
