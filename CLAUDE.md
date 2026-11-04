# RedEduca – Front (grupo 1)

Reglas del proyecto para cualquier asistente de código o integrante del equipo.

## Stack

- Next.js 16 (App Router, Turbopack) con TypeScript, Tailwind CSS v4 y carpeta `src/`. Con **Cache Components** y **Partial Prefetching** activados (`next.config.ts`).
- React 19.
- Tests: Vitest (`npm test`) y Playwright (`npm run test:e2e`, los navegadores se instalan en CI). Lint: `npm run lint`. Build: `npm run build`.
- Supabase: `@supabase/supabase-js` y `@supabase/ssr`.

## Idioma

- Código, nombres de archivos, tipos y funciones en inglés.
- Comentarios, textos visibles y rutas de URL en español.

## Datos y seguridad

- Solo datos inventados. Nunca nombres, DNI ni datos reales.
- Ningún secreto en el repositorio (es público). Usar variables de entorno y documentarlas en `.env.example` sin valores. Los valores reales van en `.env.local` (ignorado por git).
- Nadie (persona o asistente) abre, lee ni pega el contenido de `.env.local` ni de ningún `.env*`.
- Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (la anon/public, nunca la service_role) y `NEXT_PUBLIC_API_URL`.
- Si el login dice "Cannot POST /auth/v1/token", `NEXT_PUBLIC_SUPABASE_URL` tiene la dirección del Back. Si una pantalla dice "Not Found", `NEXT_PUBLIC_API_URL` apunta a un Back sin esa ruta.

## Pantallas

- Toda pantalla funciona en celular (390 px) y en escritorio, sin scroll horizontal. Punto de quiebre principal: 1024 px (`lg:`).
- Pie exacto, visible en todas las pantallas y en `/ingresar`:
  "Creado por alumnos de IES Nº 6 de Perico, Jujuy, Argentina" (con `º`, no `°`).
- El título de la app es "RedEduca". Ningún texto, metadato ni licencia presenta a RedEduca como producto de Red Impulso, y no debe aparecer "© 2026".
- Accesibilidad (WCAG AA): elementos nativos (`button`, `input` con etiqueta, `select`), `aria-label` donde no hay texto visible, alertas con `role="alert"`, foco visible y áreas táctiles de al menos 44×44 px. Nunca comunicar algo solo con color: va con número o texto.

## Marca (B-03)

- Ícono de RedEduca (nunca el de Vercel) en `src/app/icon.svg`, `src/app/icon.png` (512×512) y `src/app/favicon.ico`. Next.js los detecta solo; no agregar `<link rel="icon">` a mano. Si UX entrega un SVG oficial, reemplazar `icon.svg` y regenerar `icon.png` y `favicon.ico` desde él.
- Tipografía: Poppins cargada con `next/font/google` en `src/app/layout.tsx` (variable `--font-poppins`), con la letra del sistema como respaldo. No cargar otras fuentes.
- Paleta en `src/app/globals.css`: tinta `#14213d` (`--ink`), naranja `#f46a3c` (`--accent`), azul `#2563eb` (`--blue`), verde `#0f8a81` (`--brand`), fondo de tarjetas `#ffffff` (`--surface`), amarillo de atención `--warning` / `--warning-bg` (notas de 6 a 6,9 y avisos).
- Usar siempre las clases de la marca (`bg-brand`, `text-ink`, `bg-accent`, `border-line`, `text-muted`, `bg-blue`, `text-warning`, `bg-warning-bg`, `bg-error-bg`, etc.). No usar colores `zinc` ni valores hexadecimales sueltos en los componentes.
- Logo: `src/components/brand/logo.tsx` (usa `/icon.svg`). En fondo oscuro "Red" va en verde resaltante y "Educa" en blanco; en fondo claro "Red" en `text-brand` y "Educa" en `text-ink`.
- Las decisiones visuales pendientes (tipografía, color del botón primario, menú lateral o barra inferior, etc.) las toma UX: no se cambian sin su aviso.

## Autenticación (B-09)

- Cliente de Supabase para el navegador en `src/lib/supabase/client.ts` (`createClient()`); mensajes de error en español en `src/lib/supabase/auth-error.ts`; cierre de sesión en `src/lib/supabase/sign-out.ts`.
- `/ingresar` usa `signInWithPassword`; todo error se muestra en pantalla (`role="alert"`). En desarrollo se agrega el detalle técnico. "Recordarme" guarda solo el correo. El mensaje de error es genérico a propósito (no distingue correo de contraseña).
- `/recuperar-contrasena` usa `resetPasswordForEmail` y responde siempre "Si el correo existe, enviamos un enlace.".
- `src/proxy.ts` (Next 16 usa `proxy.ts`, no `middleware.ts`) renueva la sesión y redirige a `/ingresar` toda ruta sin sesión. Rutas públicas en `PUBLIC_PATHS`: `/ingresar` y `/recuperar-contrasena`. Sin variables de Supabase también redirige.
- El botón "Salir" (header del panel) abre un modal "¿Cerrar sesión?", cierra la sesión de Supabase y hace una recarga completa a `/ingresar` (`window.location.assign`, con `eslint-disable` explicado) porque Cache Components conserva el estado de las pantallas ya visitadas.
- Usuarios demo los crea Back con su seed (`admin@`, `docente1@`, `tutor1@`… de la "Escuela Demo Perico", el correo termina en `.rededuca`); la contraseña la pasa Back por privado, nunca se escribe en el repo.
- Tests e2e en `e2e/auth.spec.ts` y `e2e/footer.spec.ts`.

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
- `GET /me` devuelve `{ profile: { id, fullName, phone }, memberships: [{ id, institutionId, institutionName, role }] }`.
- `GET /me/subjects` y `GET /me/courses` responden **solo al rol `teacher`**; `GET /me/students` solo a `guardian`. Las pantallas de otros roles muestran un aviso en vez de llamar a la API.
- `apiFetch<T>(path, init?)` en `src/lib/api.ts`: agrega `Authorization` (token de la sesión de Supabase) y `X-Institution-Id` (membresía activa, la fija `SessionProvider` con `setActiveInstitutionId`), usa `NEXT_PUBLIC_API_URL` y lanza `ApiError { status, message }` si la respuesta no es 2xx (`status: 0` si no hay conexión).
- Sesión: `SessionProvider` (`src/features/session/session-provider.tsx`) llama a `GET /me` y vive en `src/app/(panel)/layout.tsx`, no en el layout raíz (`/ingresar` no la usa). `useSession()` (`use-session.ts`) devuelve `{ profile, memberships, active }`; tipos y `ROLE_LABELS` en `types.ts`. La membresía activa es la primera (el selector llega en M10-2). Un 401 de la API redirige a `/ingresar`.
- Menú: `getNavItems(role)` y `navItems` en `src/config/navigation.ts` (una línea por ítem; cada módulo agrega las suyas, previo aviso a UX); `studentTabs` en `src/config/student-tabs.ts` (hoy tiene "Notas").
- Pantallas con sesión van dentro de `src/app/(panel)/` (header + menú por rol). `/` redirige a `/inicio`.

## Cómo se arman las pantallas (Next 16 con Cache Components)

- Cada `page.tsx` del panel es de servidor, con `export const instant = false;` (sin eso Next da el error "instant navigation") y solo renderiza un componente cliente. La lógica y los datos viven en `src/features/<módulo>/`.
- En rutas dinámicas (`[studentId]`) ni el layout ni la página leen `params` en el servidor: el componente cliente usa `useParams()`. El build lo marca `◐` (prerenderizado parcial).
- Los datos se piden con `apiFetch` dentro de un `useEffect` con `.then/.catch` y una bandera `cancelled`. No se llama a `setState` de forma síncrona dentro de un efecto (lo marca el lint): el "cargando" se deriva comparando una clave (por ejemplo `subjectId:periodId`) con la del último resultado.
- Todo componente de datos maneja los estados cargando (`SkeletonLines`), vacío (`EmptyState`), error con "Reintentar" (`ErrorState`) y éxito (toast).
- Componentes compartidos en `src/components/ui/`: `toast.tsx` (`ToastProvider` en el layout raíz y `useToast`), `confirm-dialog.tsx`, `skeleton.tsx`, `empty-state.tsx`, `error-state.tsx`.
- Para un cambio de pantalla con datos sin guardar se usa `useUnsavedChangesGuard` (`src/features/grades/use-unsaved-changes-guard.ts`) con `ConfirmDialog` ("Seguir editando" / "Salir sin guardar"). No puede frenar los botones atrás/adelante del navegador.

## Calificaciones (M1)

- Código en `src/features/grades/`. Back entrega **una nota por alumno, materia y período** (no hay 3 notas, promedio ni observaciones).
- Endpoints: `GET /me/subjects`, `GET /grading-periods`, `GET /grades?subjectId=&periodId=` (alumnos ya ordenados por apellido; `value` puede ser `null`), `PUT /grades` (`{ subjectId, periodId, entries: [{ studentId, value }] }` → `{ saved }`; ignora los `null`, no borra notas; `saved: 0` si no hubo cambios), `GET /students/:studentId/grades` (tutor).
- Escala 1 a 10, aprobación en 6 (supuesto de UX, a validar con la institución). Las reglas están en `grade-rules.ts`: validación (coma o punto, hasta 2 decimales), promedio con 1 decimal y semáforo (7 o más verde "Satisfactorio", 6 a 6,9 amarillo "Atención", menos de 6 rojo "Bajo", siempre con número y texto).
- La lógica de edición (`grade-drafts.ts`) y el resumen del tutor (`student-grades.ts`) son funciones puras con tests.
- Planilla del docente: `/calificaciones` (solo `teacher`). Portal del tutor: `/hijos` (lista) y `/hijos/[studentId]/notas` (solo `guardian`).

## Tests

- Vitest incluye `src/**/*.test.{ts,tsx}`. No hay `jsdom` ni `@testing-library`: los componentes se prueban con `renderToStaticMarkup` (de `react-dom/server`), por eso conviene separar la parte que solo dibuja (props) de la que pide datos.
- `vitest.config.ts` no define el alias `@/`: en los tests se importa con rutas relativas y se evita importar módulos que traigan `@/lib/api` (usar `import type`).

## Flujo de trabajo

- Una tarea = un PR, siempre hacia `main`. Se mergea solo con CI en verde (lint, test, build y e2e) y aprobación de otro integrante.
- Las ramas se crean desde `origin/main` (`git switch -c <rama> origin/main`) y se suben con `git push -u origin <rama>`.
- Antes de cada commit: `git status -s` y confirmar que no hay archivos `.env*` ni de otra tarea.
- No crear ramas ni subir cambios sin acuerdo del grupo.
