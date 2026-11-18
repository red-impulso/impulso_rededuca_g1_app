import { BrandPanel } from "@/components/auth/brand-panel";
import { LoginBackdrop } from "@/components/auth/login-silhouette";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LoginForm } from "@/features/auth/login-form";

// Pantalla de servidor: solo el formulario (LoginForm) y el selector de tema son
// componentes cliente. Así la silueta y el panel de marca no suman JavaScript.
export default function LoginPage() {
  return (
    <main className="relative grid flex-1 bg-login lg:min-h-0 lg:basis-0 lg:grid-cols-2 lg:grid-rows-1">
      {/* Escritorio: fondos de cada lado y la silueta de líneas sobre el corte */}
      <LoginBackdrop />

      {/* Selector de tema: esquina de arriba a la derecha, por encima de la silueta y los brillos */}
      <div className="absolute top-4 right-4 z-10 lg:top-6 lg:right-7">
        <ThemeToggle variant="menu" />
      </div>

      {/* Panel de marca: solo en escritorio, a la izquierda */}
      <div className="hidden lg:flex">
        <BrandPanel withSilhouette />
      </div>

      {/* Formulario sin tarjeta, directo sobre el degradé, con dos brillos difuminados.
          "relative": queda por encima de la silueta. Entre 1024 y 1279 px la silueta
          tiene su ancho mínimo y el formulario necesita un poco más de margen izquierdo. */}
      <section className="relative flex items-center justify-center overflow-hidden px-6 py-10 lg:pl-16 xl:pl-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-aqua-glow opacity-60 blur-3xl dark:opacity-20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-orange-soft opacity-60 blur-3xl dark:opacity-20"
        />

        <div className="relative w-full max-w-md">
          {/* Marca compacta: solo en celular */}
          <div className="mb-8 lg:hidden">
            <Logo size={40} tone="light" />
          </div>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
