"use client";

import { useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AUTH_ERROR_MESSAGES } from "@/lib/supabase/auth-error-messages";

// Supabase (unos 66 KiB) no hace falta para dibujar el formulario: se descarga cuando la
// persona toca o enfoca el formulario, o al enviarlo. Así no frena la carga de la pantalla.
type AuthModules = {
  createClient: typeof import("@/lib/supabase/client").createClient;
  getAuthErrorMessage: typeof import("@/lib/supabase/auth-error").getAuthErrorMessage;
};
let authModules: Promise<AuthModules> | null = null;

function loadAuth(): Promise<AuthModules> {
  authModules ??= Promise.all([
    import("@/lib/supabase/client"),
    import("@/lib/supabase/auth-error"),
  ]).then(([client, authError]) => ({
    createClient: client.createClient,
    getAuthErrorMessage: authError.getAuthErrorMessage,
  }));
  // Si la descarga falla (sin conexión), el próximo intento la vuelve a pedir
  authModules.catch(() => {
    authModules = null;
  });
  return authModules;
}

function preloadAuth() {
  loadAuth().catch(() => {
    // Se vuelve a intentar al enviar, y ahí sí se muestra el error
  });
}

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

// Formulario de /ingresar. Es la única parte con estado: el resto de la pantalla
// (fondo, silueta y panel de marca) se dibuja en el servidor y no se hidrata.
export function LoginForm() {
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

  function prefetchRecovery() {
    router.prefetch("/recuperar-contrasena");
  }

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
    let auth: AuthModules;
    try {
      auth = await loadAuth();
    } catch {
      setError(AUTH_ERROR_MESSAGES.network);
      setLoading(false);
      return;
    }
    const { createClient, getAuthErrorMessage } = auth;
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
    <form
      onSubmit={handleSubmit}
      onFocus={preloadAuth}
      onPointerDown={preloadAuth}
      className="flex flex-col gap-5"
      noValidate
    >
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
          className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 shadow-sm text-base font-normal text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
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
            className="w-full rounded-lg border border-line bg-surface py-2.5 shadow-sm pl-3 pr-20 text-base font-normal text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
          {/* Muestra u oculta la contraseña escrita */}
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 px-3 text-sm font-semibold text-petroleum-700 hover:underline dark:text-brand"
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
        {/* Sin prefetch al aparecer: esa pantalla trae Supabase y frenaría la carga de esta.
            Se precarga recién cuando la persona va hacia el enlace. */}
        <Link
          href="/recuperar-contrasena"
          prefetch={false}
          onMouseEnter={prefetchRecovery}
          onFocus={prefetchRecovery}
          onTouchStart={prefetchRecovery}
          className="text-sm font-semibold text-petroleum-700 underline dark:text-brand"
        >
          Recuperar contraseña
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="fx-shine w-full rounded-lg bg-linear-to-r from-brand to-blue px-4 py-2.5 font-semibold text-on-color shadow-sm disabled:opacity-60"
      >
        {loading ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
