import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "next-app-bookclub",
    short_name: "bookclub",
    description: "next-app-bookclub application",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/brand/bookclub-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
