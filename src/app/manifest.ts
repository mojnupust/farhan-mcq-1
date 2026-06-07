// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Farhan MCQ",
    short_name: "FarhanMCQ",
    description: "সরকারি চাকরির পূর্ণাঙ্গ MCQ প্রস্তুতি প্ল্যাটফর্ম",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d1b2e",
    lang: "bn",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
