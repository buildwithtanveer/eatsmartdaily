import { ImageResponse } from "next/og";
import { createElement } from "react";
 
export const runtime = "edge";
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Eat Smart Daily";
  const subtitle =
    searchParams.get("subtitle") || "Healthy Food, Diet & Nutrition Tips";
  const urlText = searchParams.get("urlText") || "eatsmartdaily.com";
 
  return new ImageResponse(
    createElement(
      "div",
      {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          backgroundColor: "#ffffff",
          color: "#0f172a",
          border: "24px solid #568c2c",
        },
      },
      createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "18px" } },
        createElement(
          "div",
          {
            style: {
              fontSize: "72px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-1px",
            },
          },
          title,
        ),
        createElement(
          "div",
          {
            style: {
              fontSize: "34px",
              fontWeight: 600,
              lineHeight: 1.25,
              color: "#334155",
            },
          },
          subtitle,
        ),
      ),
      createElement(
        "div",
        {
          style: {
            fontSize: "28px",
            fontWeight: 700,
            color: "#568c2c",
          },
        },
        urlText,
      ),
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
