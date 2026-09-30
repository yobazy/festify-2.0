import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Front Left: who's playing, and why you should care";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0a0a0a";
const PAPER = "#f2f0eb";
const SMOKE = "#8a8a8a";
const SIGNAL = "#00d4aa";

/**
 * Archivo 900 from Google Fonts at request time. The old Firefox UA makes the
 * CSS endpoint serve TTF/WOFF, which ImageResponse can read (it cannot read WOFF2).
 * Falls back to the bundled Gotham Bold if the fetch fails.
 */
async function loadDisplayFont(): Promise<{ name: string; data: ArrayBuffer | Buffer }> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Archivo:wght@900",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:12.0) Gecko/20100101 Firefox/12.0",
        },
      }
    ).then((res) => {
      if (!res.ok) throw new Error(`Font CSS ${res.status}`);
      return res.text();
    });

    const match = css.match(/url\((https:\/\/[^)]+\.(?:ttf|woff))\)/);
    if (!match) throw new Error("No TTF/WOFF source in font CSS");

    const data = await fetch(match[1]).then((res) => {
      if (!res.ok) throw new Error(`Font file ${res.status}`);
      return res.arrayBuffer();
    });

    return { name: "Archivo", data };
  } catch {
    const data = await readFile(join(process.cwd(), "public/fonts/Gotham-Bold.otf"));
    return { name: "Gotham-Bold", data };
  }
}

export default async function OpengraphImage() {
  const font = await loadDisplayFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px 72px 56px",
          backgroundColor: INK,
          color: PAPER,
          fontFamily: font.name,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 64 64" aria-hidden="true">
            <rect x="6" y="6" width="52" height="8" fill={PAPER} />
            <g fill={PAPER} fillOpacity="0.38">
              <circle cx="27" cy="28" r="3" />
              <circle cx="41" cy="28" r="3" />
              <circle cx="55" cy="28" r="3" />
              <circle cx="13" cy="42" r="3" />
              <circle cx="27" cy="42" r="3" />
              <circle cx="41" cy="42" r="3" />
              <circle cx="55" cy="42" r="3" />
              <circle cx="13" cy="56" r="3" />
              <circle cx="27" cy="56" r="3" />
              <circle cx="41" cy="56" r="3" />
              <circle cx="55" cy="56" r="3" />
            </g>
            <circle cx="13" cy="28" r="6" fill={SIGNAL} />
          </svg>
          <div style={{ fontSize: 28, color: SMOKE, letterSpacing: -0.5 }}>
            Who&apos;s playing, and why you should care.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 180,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: -6,
              textTransform: "uppercase",
              color: PAPER,
            }}
          >
            <span>Front</span>
            <span>Left</span>
          </div>
          <div style={{ fontSize: 24, color: SMOKE, paddingBottom: 10 }}>
            See you front left.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: font.name, data: font.data, weight: 900 }],
    }
  );
}
