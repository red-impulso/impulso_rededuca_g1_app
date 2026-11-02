"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { BrandPanel } from "@/components/auth/brand-panel";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/supabase/auth-error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RecoverPasswordPage() {
const [email, setEmail] = useState("");
const [loading, setLoading] = useState(false);
const [sent, setSent] = useState(false);
const [error, setError] = useState<string | null>(null);

  // Pide a Supabase el enlace para cambiar la contraseña
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSent(false);

    const trimmedEmail = email.trim();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
        setError("Ingresa un correo válido.");
        return;
    }

    setLoading(true);
    try {
    const supabase = createClient();
    const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(trimmedEmail);
    if (resetError) {
        setError(getAuthErrorMessage(resetError));
        return;
    }
    // El mensaje es el mismo exista o no el correo, para no revelar qué cuentas existen
    setSent(true);
    } catch (err) {
        setError(getAuthErrorMessage(err));
    } finally {
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
        <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white"
                aria-hidden="true"
            >
                R
            </div>
            <p className="text-lg font-semibold text-ink">RedEduca</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <h2 className="text-2xl font-semibold text-ink">Recuperar contraseña</h2>

            {error && (
            <p
                role="alert"
                className="rounded-lg bg-error-bg px-4 py-3 text-sm text-error"
            >
                {error}
            </p>
            )}

            {sent && (
            <p
                role="status"
                className="rounded-lg bg-success-bg px-4 py-3 text-sm text-success"
            >
                Si el correo existe, enviamos un enlace.
            </p>
            )}

            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Correo electrónico
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="nombre@institucion.edu"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-base font-normal text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
            </label>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-white disabled:opacity-60"
            >
                {loading ? "Enviando…" : "Enviar enlace"}
            </button>

            <Link
                href="/ingresar"
                className="text-center text-sm font-medium text-brand hover:underline"
            >
                Volver a ingresar
            </Link>
        </form>
        </div>
    </section>
    </main>
);
}