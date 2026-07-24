import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Rehberiniz — Öğrenci takip ve rehberlik platformu";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        background: "#4F6BED",
        padding: 80,
        color: "white",
      }}
    >
      <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>
        Rehberiniz
      </div>
      <div style={{ fontSize: 38, opacity: 0.85, marginTop: 16 }}>
        Öğrenci, öğretmen ve kurum tek bir ekranda.
      </div>
    </div>,
    size,
  );
}
