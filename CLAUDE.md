# RedEduca – Front (grupo 1)

Reglas del proyecto para cualquier asistente de código o integrante del equipo.

## Stack
- Next.js 16 (App Router, Turbopack) con TypeScript, Tailwind CSS v4 y carpeta `src/`.
- Tests: Vitest (`npm test`) y Playwright (`npm run test:e2e`, los navegadores se instalan en CI). Lint: `npm run lint`. Build: `npm run build`.
- Supabase: `@supabase/supabase-js` y `@supabase/ssr`.

## Idioma
- Código, nombres de archivos, tipos y funciones en inglés.
- Comentarios, textos visibles y rutas de URL en español.

## Datos y seguridad
- Solo datos inventados. Nunca nombres, DNI ni datos reales.
- Ningún secreto en el repositorio (es público). Usar variables de entorno y documentarlas en `.env.example` sin valores. Los valores reales van en `.env.local` (ignorado por git).
- Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (la anon/public, nunca la service_role) y `NEXT_PUBLIC_API_URL`.

## Pantallas
- Toda pantalla funciona en celular (390 px) y en escritorio, sin scroll horizontal.
- Pie exacto, visible en todas las pantallas y en `/ingresar`:
  "Creado por alumnos de IES Nº 6 de Perico, Jujuy, Argentina" (con `º`, no `°`).
- El título de la app es "RedEduca". Ningún texto, metadato ni licencia presenta a RedEduca como producto de Red Impulso, y no debe aparecer "© 2026".

## Marca (B-03)
- Ícono de RedEduca (nunca el de Vercel) en `src/app/icon.svg`, `src/app/icon.png` (512×512) y `src/app/favicon.ico`. Next.js los detecta solo; no agregar `<link rel="icon">` a mano. Si UX entrega un SVG oficial, reemplazar `icon.svg` y regenerar `icon.png` y `favicon.ico` desde él.
- Tipografía: Poppins cargada con `next/font/google` en `src/app/layout.tsx` (variable `--font-poppins`), con la letra del sistema como respaldo. No cargar otras fuentes.
- Paleta en `src/app/globals.css`: tinta `#14213d` (`--ink`), naranja `#f46a3c` (`--accent`), azul `#2563eb` (`--blue`), verde `#0f8a81` (`--brand`), fondo de tarjetas `#ffffff` (`--surface`).
- Usar siempre las clases de la marca (`bg-brand`, `text-ink`, `bg-accent`, `border-line`, `text-muted`, etc.). No usar colores `zinc` ni valores hexadecimales sueltos en los componentes.

## Autenticación (B-09)
- Cliente de Supabase para el navegador en `src/lib/supabase/client.ts` (`createClient()`); mensajes de error en español en `src/lib/supabase/auth-error.ts`; cierre de sesión en `src/lib/supabase/sign-out.ts`.
- `/ingresar` usa `signInWithPassword`; todo error se muestra en pantalla (`role="alert"`). En desarrollo se agrega el detalle técnico.
- `src/proxy.ts` (Next 16 usa `proxy.ts`, no `middleware.ts`) renueva la sesión y redirige a `/ingresar` toda ruta sin sesión. Rutas públicas: solo `/ingresar` (`PUBLIC_PATHS`). Sin variables de Supabase también redirige.
- El botón "Salir" cierra la sesión de Supabase y borra el perfil activo.
- Usuarios demo los crea Back con su seed (`admin@`, `docente1@`, `tutor1@`… de la "Escuela Demo Perico"); la contraseña la pasa Back por privado, nunca se escribe en el repo.
- Tests e2e en `e2e/auth.spec.ts`: sin sesión `/` e `/inicio` terminan en `/ingresar`; `/ingresar` muestra el pie exacto y el error visible.

## PWA instalable (B-11)
- `src/app/manifest.ts` (convención de Next.js) sirve `/manifest.webmanifest`: `name`/`short_name` "RedEduca", `display: "standalone"`, `start_url: "/"`, `lang: "es"`.
- `theme_color` = `--brand` y `background_color` = `--page` de `globals.css`; el test `src/app/manifest.test.ts` los compara con el CSS. Si cambia la paleta, actualizar el manifiesto.
- Íconos PNG de 192 y 512 px en `public/icons/`, generados desde `src/app/icon.png`. Si cambia el ícono de marca, regenerarlos.
- `src/proxy.ts` excluye `manifest.webmanifest` del matcher: el navegador lo pide sin sesión (en `/ingresar`) y una redirección rompería la instalación.
- Pendiente: verificación manual en Android/Chrome ("Agregar a pantalla de inicio" y apertura sin barra del navegador); la hace una persona del grupo.

## Entorno local
- API de Back en `http://localhost:3000`; el Front se levanta con `npm run dev -- -p 3001`. CI corre el Front solo en el puerto 3000.

## Contratos con la API
- `type Role = 'admin' | 'director' | 'teacher' | 'guardian'`.
- Requests autenticados: `Authorization: Bearer <access_token>` y `X-Institution-Id: <uuid>`.
- `GET /me` devuelve `{ profile: { id, fullName, phone }, memberships: [{ id, institutionId, institutionName, role }] }`; `GET /me/subjects` y `/me/courses` (docente), `GET /me/students` (tutor).
- `apiFetch<T>(path, init?)` en `src/lib/api.ts` (pendiente), `useSession()` en `src/features/session/`, `navItems` en `src/config/navigation.ts`, `studentTabs` en `src/config/student-tabs.ts` (pendiente).

## Flujo de trabajo
- Una tarea = un PR. Se mergea solo con CI en verde y aprobación de otro integrante.
- No crear ramas ni subir cambios sin acuerdo del grupo.