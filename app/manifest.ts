import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rehberiniz",
    short_name: "Rehberiniz",
    description: "Öğrenci takip ve rehberlik platformu",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    lang: "tr",
    background_color: "#F5F5F5",
    theme_color: "#4F6BED",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
