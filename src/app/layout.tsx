import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SessionProvider } from "@/features/session/session";
import "./globals.css";

// Tipografía de la marca: se descarga en el build y queda dentro del proyecto
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RedEduca",
  description: "Aplicación para docentes y familias",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
        <SiteFooter />
      </body>
    </html>
  );
}