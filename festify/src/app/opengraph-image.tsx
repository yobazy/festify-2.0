import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Festify: discover EDM events, lineups and playlists";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [bold, light, iconSvg] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/Gotham-Bold.otf")),
    readFile(join(process.cwd(), "public/fonts/Gotham-Light.otf")),
    readFile(join(process.cwd(), "public/images/logo.svg")),
  ]);
  const icon = `data:image/svg+xml;base64,${iconSvg.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 96px",
          gap: 64,
          backgroundColor: "#0d0a12",
          backgroundImage:
            "radial-gradient(circle at 25% 70%, rgba(156,29,185,0.45), transparent 55%)",
          color: "#e2dce8",
        }}
      >
        <img src={icon} width={256} height={256} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Gotham-Bold",
              fontSize: 112,
              color: "#ffffff",
              letterSpacing: 2,
            }}
          >
            Festify
          </div>
          <div
            style={{
              fontFamily: "Gotham-Light",
              fontSize: 36,
              marginTop: 12,
              color: "#8b7fa0",
              maxWidth: 640,
            }}
          >
            Find the festival. Hear the lineup before you go.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Gotham-Bold", data: bold, weight: 700 },
        { name: "Gotham-Light", data: light, weight: 300 },
      ],
    }
  );
}
