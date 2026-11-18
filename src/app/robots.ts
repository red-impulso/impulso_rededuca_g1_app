import type { MetadataRoute } from "next";

// Sirve /robots.txt como texto plano (convención de Next.js). Antes no existía: el proxy
// lo mandaba a /ingresar y los buscadores recibían HTML. La política no cambia: se permite
// todo, porque las pantallas privadas ya redirigen a /ingresar sin sesión (src/proxy.ts).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
  };
}
