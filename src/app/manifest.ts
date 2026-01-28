
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eat Smart Daily",
    short_name: "EatSmartDaily",
    description: "Healthy Food, Diet & Nutrition Tips",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#568c2c",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
