import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const logoData = readFileSync(
    join(process.cwd(), "public/logos/logo-no-tagline.png")
  ).toString("base64");
  const logoSrc = `data:image/png;base64,${logoData}`;

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
          backgroundColor: "#0F172A",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={340} height={340} alt="Statline" />
        <div
          style={{
            marginTop: 8,
            fontSize: 32,
            letterSpacing: 6,
            color: "#93C5FD",
            textTransform: "uppercase",
          }}
        >
          Data. Performance. Opportunity.
        </div>
      </div>
    ),
    { ...size }
  );
}
