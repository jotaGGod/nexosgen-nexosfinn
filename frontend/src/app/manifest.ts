import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "NexosFinn",
    short_name: "NexosFinn",
    description: "Suas finanças sob controle.",
    start_url: "/",
    scope: "/",
    display: "fullscreen",
    orientation: "portrait-primary",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
