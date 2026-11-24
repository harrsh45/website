import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = "The Lumen Desk: custom websites for independent businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (pkg: string, file: string) => readFile(join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file));

export default async function OpengraphImage() {
  const [logo, display, displayItalic, text] = await Promise.all([
    readFile(join(process.cwd(), "public", "brand", "logo.png")),
    font("fraunces", "fraunces-latin-500-normal.woff"),
    font("fraunces", "fraunces-latin-400-italic.woff"),
    font("geist", "geist-latin-600-normal.woff"),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#F7F6F2",
          color: "#132237",
          padding: "0 72px",
          gap: 56,
        }}
      >
        {/* The supplied logo on its own canvas colour, unchanged. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={400} height={400} alt="" style={{ borderRadius: 32 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 22, flex: 1 }}>
          <div style={{ fontFamily: "Geist", fontSize: 24, letterSpacing: 4.5, fontWeight: 600 }}>THE LUMEN DESK</div>
          <div
            style={{
              fontFamily: "Fraunces",
              fontWeight: 500,
              fontStyle: "normal",
              fontSize: 64,
              lineHeight: 1.04,
              letterSpacing: -1.5,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Make your first impression&nbsp;
            <span style={{ fontStyle: "italic", fontWeight: 400 }}>worth remembering.</span>
          </div>
          <div style={{ display: "flex", fontFamily: "Geist", fontSize: 26, color: "#4A5669", lineHeight: 1.4 }}>
            {`Custom websites for beauty studios and independent businesses. ${site.domain}`}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: display, style: "normal", weight: 500 },
        { name: "Fraunces", data: displayItalic, style: "italic", weight: 400 },
        { name: "Geist", data: text, style: "normal", weight: 600 },
      ],
    },
  );
}
