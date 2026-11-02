"use client";

import { useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandPanel } from "@/components/auth/brand-panel";
import { Logo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/supabase/auth-error";

// "Recordarme" guarda solo el correo en este navegador (nunca la contraseña)
const REMEMBERED_EMAIL_KEY = "rededuca:remembered-email";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readRememberedEmail() {
  try {
    return window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

// En el servidor no hay navegador: no hay correo recordado
function readRememberedEmailOnServer() {
  return "";
}

function saveRememberedEmail(email: string | null) {
  try {
    if (email) window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    else window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  } catch {
    // Sin almacenamiento disponible (modo privado, por ejemplo): se ingresa igual
  }
}

export default function LoginPage() {
  const router = useRouter();
  const rememberedEmail = useSyncExternalStore(
    subscribeToStorage,
    readRememberedEmail,
    readRememberedEmailOnServer,
  );
  // null = la persona todavía no tocó el campo: se usa el correo recordado
  const [typedEmail, setTypedEmail] = useState<string | null>(null);
  const [rememberChoice, setRememberChoice] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const email = typedEmail ?? rememberedEmail;
  const remember = rememberChoice ?? rememberedEmail !== "";

  // Ingreso real con Supabase: si falla, muestra el error en pantalla
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Completá tu correo y tu contraseña.");
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("Ingresa un correo válido.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (signInError) {
        setError(getAuthErrorMessage(signInError));
        setLoading(false);
        return;
      }
      saveRememberedEmail(remember ? trimmedEmail : null);
      setPassword("");
      // Se mantiene "Ingresando…" hasta que cambie la pantalla
      setSuccess(true);
      router.push("/inicio");
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <main className="grid flex-1 lg:min-h-0 lg:basis-0 lg:grid-cols-2 lg:grid-rows-1">
      {/* Panel de marca: solo en escritorio, a la izquierda */}
      <div className="hidden lg:flex">
        <BrandPanel />
      </div>

      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Marca compacta: solo en celular */}
          <div className="mb-8 lg:hidden">
            <Logo size={40} tone="light" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div>
              <h2 className="text-2xl font-semibold text-ink">
                Te damos la bienvenida
              </h2>
              <p className="mt-1 text-muted">Ingresa con tu cuenta institucional.</p>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-error-bg px-4 py-3 text-sm text-error"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                role="status"
                className="rounded-lg bg-success-bg px-4 py-3 text-sm text-success"
              >
                Acceso correcto. Redirigiendo al inicio…
              </p>
            )}

            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
              Correo electrónico
              <input
                type="email"
                value={email}
                onChange={(e) => setTypedEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-base font-normal text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
              Contraseña
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-line bg-surface py-2.5 pl-3 pr-20 text-base font-normal text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
                {/* Muestra u oculta la contraseña escrita */}
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 px-3 text-sm font-semibold text-brand hover:underline"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRememberChoice(e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                Recordarme
              </label>
              <Link
                href="/recuperar-contrasena"
                className="text-sm font-semibold text-brand underline"
              >
                Recuperar contraseña
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
