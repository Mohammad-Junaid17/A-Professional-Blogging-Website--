import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Islam360",
    short_name: "Islam360",
    description:
      "A comprehensive encyclopaedia and educational platform for Islamic sciences, jurisprudence, theology, and Sunni scholarly tradition.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAF8",
    theme_color: "#1B5E20",
    icons: [
      {
        src: "/icon.png",
        sizes: "516x516",
        type: "image/png",
      },
    ],
  };
}
