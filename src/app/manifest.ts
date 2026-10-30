import type { MetadataRoute } from "next";

// Manifiesto de la app web: permite instalar RedEduca desde el navegador del celular.
// Los colores son los de la marca definidos en globals.css:
// theme_color = --brand (verde) y background_color = --page (fondo de las pantallas).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RedEduca",
    short_name: "RedEduca",
    description: "RedEduca: comunicación entre la escuela y las familias",
    start_url: "/",
    lang: "es",
    display: "standalone",
    theme_color: "#0f8a81",
    background_color: "#f6f8fb",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
