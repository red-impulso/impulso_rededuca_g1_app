"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { BrandPanel } from "@/components/auth/brand-panel";
import { Logo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/supabase/auth-error";
import { signOut } from "@/lib/supabase/sign-out";

const MIN_PASSWORD_LENGTH = 8;

// checking = validando el enlace del correo; ready = se puede escribir la contraseña;
// invalid = enlace vencido o ya usado; done = contraseña cambiada
type LinkStatus = "checking" | "ready" | "invalid" | "done";

const INPUT_STYLES =
  "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-base font-normal text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

// Pantalla a la que lleva el enlace de "Recuperar contraseña" (redirectTo).
// El cliente de Supabase canjea el código del enlace por una sesión temporal al iniciar;
// con esa sesión se llama a updateUser y después se cierra la sesión.
export default function NewPasswordPage() {
  const [status, setStatus] = useState<LinkStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    Promise.resolve()
      .then(() => {
        const supabase = createClient();
        // Si el canje del enlace termina después, igual se habilita el formulario
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (cancelled || !session) return;
          if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setStatus("ready");
        });
        unsubscribe = () => data.subscription.unsubscribe();
        return supabase.auth.getSession();
      })
      .then(({ data }) => {
        if (!cancelled) setStatus((current) => (current === "checking" ? (data.session ? "ready" : "invalid") : current));
      })
      .catch(() => {
        if (!cancelled) setStatus("invalid");
      });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña tiene que tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) {
        setError(getAuthErrorMessage(updateError));
        return;
      }
      // La sesión del enlace no se usa para entrar: se ingresa con la contraseña nueva
      await signOut();
      setPassword("");
      setConfirmation("");
      setStatus("done");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
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

          <h2 className="mb-5 text-2xl font-semibold text-ink">Nueva contraseña</h2>

          {status === "checking" && (
            <p role="status" className="text-muted">
              Verificando el enlace…
            </p>
          )}

          {status === "invalid" && (
            <div className="flex flex-col gap-4">
              <p role="alert" className="rounded-lg bg-error-bg px-4 py-3 text-sm text-error">
                El enlace venció o ya se usó. Pedí uno nuevo.
              </p>
              <Link href="/recuperar-contrasena" className="text-sm font-semibold text-brand underline">
                Pedir otro enlace
              </Link>
            </div>
          )}

          {status === "done" && (
            <div className="flex flex-col gap-4">
              <p role="status" className="rounded-lg bg-success-bg px-4 py-3 text-sm text-success">
                Listo. Ya podés ingresar con tu contraseña nueva.
              </p>
              <Link
                href="/ingresar"
                className="w-full rounded-lg bg-brand px-4 py-2.5 text-center font-semibold text-white"
              >
                Ir a ingresar
              </Link>
            </div>
          )}

          {status === "ready" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              {error && (
                <p role="alert" className="rounded-lg bg-error-bg px-4 py-3 text-sm text-error">
                  {error}
                </p>
              )}

              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Contraseña nueva
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  aria-describedby="nueva-contrasena-ayuda"
                  className={INPUT_STYLES}
                />
              </label>
              <p id="nueva-contrasena-ayuda" className="-mt-3 text-xs text-muted">
                Al menos {MIN_PASSWORD_LENGTH} caracteres.
              </p>

              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Repetir contraseña
                <input
                  type="password"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  autoComplete="new-password"
                  className={INPUT_STYLES}
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar contraseña"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
