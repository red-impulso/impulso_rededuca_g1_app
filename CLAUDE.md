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
- Carpetas y archivos en minúscula (`announcements`, no `Announcements`). Windows no distingue mayúsculas, pero Linux (CI y Vercel) sí: una carpeta con otra mayúscula pasa en local y rompe el build allá.

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

## Paleta y modo oscuro (propuesta, pendiente de aprobación de UX)

- Variables nuevas en `:root` de `src/app/globals.css`, expuestas en `@theme inline`:
  - petróleo: `--petroleum-900/800/700/500`;
  - agua: `--aqua-300`, `--aqua-100`, `--aqua-glow`;
  - durazno y cielo: `--peach-200/100/50` y `--sky-50`;
  - `--orange-soft`;
  - silueta del login: `--sky-300`, `--sky-400`, `--cyan-400`, `--blue-500`, `--green-400`, `--mint-50` y `--mint-200` (iguales en `.dark`);
  - `--footer-bg`/`--footer-text`;
  - header "medio": `--header-from`, `--header-via`, `--header-to` y `--header-line` (con sus valores en `.dark`).
  
  Clases: `bg-petroleum-800`, `text-peach-50`, `from-peach-200`, etc.
- `--on-color` (`text-on-color`): texto sobre un fondo de color lleno (`bg-brand`, `bg-blue`, `bg-error`). Es blanco en claro y petróleo en oscuro, porque ahí esos fondos son claros y el blanco no llega a AA. **No usar `text-white` sobre esos fondos.**
- Sobre `bg-ink` (toast, iniciales), el texto va en `text-surface`. Detrás de modales y paneles, el fondo va en `bg-overlay/50` (no `bg-ink/50`, que en oscuro se aclara).
- Fondos con degradé: `bg-login` (`--login-bg`: lado derecho de `/ingresar`, `/recuperar-contrasena` y `/nueva-contrasena`) y `bg-panel` (`--panel-bg`, sube oscuro desde el footer). `--panel-bg` tiene los cortes en px y el `<main>` del panel lleva `pb-32` para que el texto fuera de tarjetas no caiga sobre la franja oscura.
- Silueta del login (solo `/ingresar` y solo `lg:`): una "cinta de malla" en S hecha de líneas finas sobre el corte entre el panel verde y el durazno, sin íconos.
  - Cálculo: `src/components/auth/silhouette-paths.ts` (función pura con test), con 4 bordes `x(y) = 200 + off + a·sin(2π(y+80)/1173 + ph)` en un `viewBox` de 400 × 1000. La cinta 1 tiene 50 líneas entre A y B; la cinta 2, 36 entre C y D; y hay 12 líneas de puntitos (son líneas de la cinta 1: el dibujo las reutiliza con `<use>`). Cada línea visible son 10 curvas Bézier (error < 0,05 unidades); los cortes de los fondos y las máscaras siguen con 140 tramos rectos. Con 140 tramos por línea el HTML de `/ingresar` pesaba ~170 KB más.
  - Dibujo: `src/components/auth/login-silhouette.tsx` (`LoginBackdrop`, sin `"use client"`). En claro, el verde ocupa todo el fondo y el durazno va encima, con una máscara desde `max(xB, xD) + 6` y una línea `--mint-50` difuminada. En oscuro, el fondo oscuro de siempre y el verde encima, con una máscara hasta `xA - 20`. Las máscaras son SVG en `data:` armados con los mismos paths, así que se estiran junto con la silueta. Los colores del SVG van como `var(--…)` en `style`.
  - Ancho: `--login-silhouette-w: clamp(120px, calc(64vw - 634px), 400px)`, con unos 185 px a 1280 y 369 px a 1568. Las líneas llegan a 0,39 × ancho a la derecha del corte y quedan siempre ~20 px antes del formulario. Entre 1024 y 1279 px el formulario lleva `lg:pl-16`. El texto del panel deja libre 0,33 × ancho + 24 px (`BrandPanel withSilhouette`).
  - Con `preserveAspectRatio="none"` la S se estira con el alto de la ventana, pero las líneas conservan su grosor (`vector-effect="non-scaling-stroke"`).
  - `/recuperar-contrasena` y `/nueva-contrasena` usan `BrandPanel` sin silueta: panel verde con corte recto.
- Header "medio" (`app-header.tsx`): `bg-linear-to-r from-header-from via-header-via via-60% to-header-to` con borde `border-header-line` y texto `text-ink`. Ítem activo `bg-brand text-on-color`; los demás `text-ink` con `fx-nav-item` (al pasar el mouse se iluminan en verde clarito). "Red" del logo con `tone="light"`, escuela y usuario en `text-muted`, "Salir" en `text-brand`. La campanita (`BELL_CLASS`) y el selector de escuela usan los mismos colores.
- Footer: oscuro en los dos modos, con degradé petróleo.
- Modo oscuro con `next-themes` (`src/components/theme/theme-provider.tsx`, en el layout raíz; `<html suppressHydrationWarning>`). `@custom-variant dark` usa la clase `.dark`. El bloque `.dark { ... }` va **después** de `:root` (`manifest.test.ts` lee los valores claros) y solo cambia valores de variables: los componentes no se tocan.
- Selector de tema: `<ThemeToggle variant="menu" | "group">` en `src/components/theme/theme-toggle.tsx`. La lógica es una sola (`useTheme` y montado con `useSyncExternalStore`); las reglas puras están en `theme-menu.ts` y el dibujo en `theme-toggle-view.tsx`, con tests. Opciones: Claro, Oscuro y Sistema (por defecto Sistema). Hasta estar montado no marca ninguna opción y muestra el ícono `sistema`.
  - `variant="menu"`: un botón de 44 px (`aria-haspopup="menu"`, `aria-label` "Tema: Claro") que abre un menú (`role="menu"`, opciones `menuitemradio`; la elegida con `bg-aqua-100 text-brand` y ✓). Se cierra al elegir, con Escape, Tab o un clic afuera; las flechas, Inicio y Fin recorren las opciones. Va en el header de escritorio (`lg:`), antes de la campanita, y en `/ingresar`, en la esquina de arriba a la derecha de la pantalla.
  - `variant="group"`: 3 botones (`role="radiogroup"`, cada uno `role="radio"`; el activo con `bg-orange-soft text-petroleum-900`). Va en celular, dentro del menú desplegable, en la fila "Tema", arriba de los ítems.
- Íconos del selector: `public/icons/tema.svg`, con los símbolos `sol`, `luna` y `sistema` en `currentColor`. **El archivo actual es provisorio**: reemplazarlo por el oficial con los mismos `id`.
- Contraste pendiente de UX (no llega a AA 4,5:1 en modo claro; en oscuro todo pasa):
  - `--brand` claro (`#0f8a81`) con texto blanco: 4,2:1 (botones e ítem activo del header);
  - "Salir" en `text-brand` sobre el header: 3,3:1;
  - opción elegida del menú de tema (`bg-aqua-100 text-brand`): 3,6:1;
  - `text-muted` sobre `--header-from`: 4,48:1 (nombre de la escuela).
- En desarrollo, React puede avisar en la consola por el `<script>` que agrega `next-themes` (evita el "flash" al cargar). No es un error.

## Animaciones (aprobadas por UX)

- Clases propias con prefijo `fx-` al final de `src/app/globals.css` (`@layer components`). No tocan las demás transiciones de los componentes.
  - `fx-shine`: botón Ingresar de `/ingresar`. Un reflejo diagonal (`--mint-50`) lo cruza, por debajo del texto, y el botón crece a 1,03.
  - `fx-nav-item`: opciones del menú del header (escritorio y celular). La opción bajo el mouse toma un fondo verde clarito (`--brand` al 22 %) con un borde y un brillo suaves; la elegida (`aria-current="page"`) sigue en `bg-brand` y no cambia. Reemplaza a la sombra interna que iluminaba todo el header.
  - `fx-lift-glow` + `fx-glow-brand` o `fx-glow-blue`: el botón sube 2 px y lo ilumina un brillo de su propio color. Lo usan "Salir" del header (verde) y los botones "Guardar…": `SaveBar`, formularios y diálogos de M6 a M10 y la asignación docente (azul), y "Guardar contraseña" (verde). Un botón "Guardar" nuevo debe llevar la clase.
  - `fx-loading-bar`: `LoadingBars` (`src/components/ui/loading-bars.tsx`), con tres barras y el texto "Cargando…". Es la carga de `SessionProvider` mientras responde `GET /me`, que es la pantalla que aparece después de iniciar sesión.
- Los efectos de hover solo se aplican con mouse (`hover: hover`) y nunca en un botón deshabilitado (`:not(:disabled)`). Con `prefers-reduced-motion` no hay movimiento ni reflejo, las sombras aparecen sin transición y las barras quedan quietas.

## Autenticación (B-09)

- Cliente de Supabase para el navegador en `src/lib/supabase/client.ts` (`createClient()`); mensajes de error en español en `src/lib/supabase/auth-error.ts`; cierre de sesión en `src/lib/supabase/sign-out.ts`: `signOut()` (si el servidor no responde, igual borra la sesión del navegador con `scope: "local"`, para no quedar en un bucle `/ingresar` ↔ `/inicio`) y `reloadToLogin()` (recarga completa a `/ingresar`).
- `/ingresar` (`page.tsx`) es de servidor: el fondo, la silueta y el panel de marca no se hidratan. El formulario es `LoginForm` (`src/features/auth/login-form.tsx`, cliente). Supabase (~66 KiB) no está en la carga inicial: se descarga con `import()` al enfocar o tocar el formulario, o al enviarlo (los textos de error sin Supabase están en `auth-error-messages.ts`). "Recuperar contraseña" lleva `prefetch={false}` y se precarga al pasar el mouse, enfocar o tocar, porque esa pantalla sí importa Supabase. "Mostrar" y "Recuperar contraseña" van en `text-petroleum-700` (en oscuro `text-brand`): con `text-brand` no llegaban a AA en claro (4,2:1 y 3,4:1).
- `/ingresar` usa `signInWithPassword`; todo error se muestra en pantalla (`role="alert"`). En desarrollo se agrega el detalle técnico. "Recordarme" guarda solo el correo. El mensaje de error es genérico a propósito (no distingue correo de contraseña).
- `/recuperar-contrasena` usa `resetPasswordForEmail` con `redirectTo: <origen>/nueva-contrasena` y responde siempre "Si el correo existe, enviamos un enlace.".
- `/nueva-contrasena` (pública): el cliente de Supabase canjea el enlace del correo por una sesión temporal; la pantalla pide la contraseña nueva (mínimo 8 caracteres, repetida), llama a `updateUser({ password })` y cierra la sesión para ingresar con la nueva. Sin enlace válido muestra "El enlace venció o ya se usó" con "Pedir otro enlace". **Configuración de Supabase (no es código):** `/nueva-contrasena` de producción y `http://localhost:3000/nueva-contrasena` tienen que estar en las URLs de redirección permitidas.
- `src/proxy.ts` (Next 16 usa `proxy.ts`, no `middleware.ts`) renueva la sesión y redirige a `/ingresar` toda ruta sin sesión. Rutas públicas en `PUBLIC_PATHS`: `/ingresar`, `/recuperar-contrasena` y `/nueva-contrasena`. Sin variables de Supabase también redirige. Con sesión, `/ingresar` redirige a `/inicio`.
- El botón "Salir" (header del panel) abre un modal "¿Cerrar sesión?", cierra la sesión de Supabase y hace una recarga completa a `/ingresar` (`reloadToLogin()`: `window.location.assign`, con `eslint-disable` explicado) porque Cache Components conserva el estado de las pantallas ya visitadas. El "Salir" de la pantalla de error de sesión hace lo mismo.
- Usuarios demo los crea Back con su seed (`admin@`, `docente1@`, `tutor1@`… de la "Escuela Demo Perico", el correo termina en `.rededuca`); la contraseña la pasa Back por privado, nunca se escribe en el repo.
- Tests e2e en `e2e/auth.spec.ts` y `e2e/footer.spec.ts`.

## PWA instalable (B-11)

- `src/app/manifest.ts` (convención de Next.js) sirve `/manifest.webmanifest`: `name`/`short_name` "RedEduca", `display: "standalone"`, `start_url: "/"`, `lang: "es"`.
- `theme_color` = `--brand` y `background_color` = `--page` de `globals.css`; el test `src/app/manifest.test.ts` los compara con el CSS. Si cambia la paleta, actualizar el manifiesto.
- Íconos PNG de 192 y 512 px en `public/icons/`, generados desde `src/app/icon.png`. Si cambia el ícono de marca, regenerarlos.
- `src/proxy.ts` excluye `manifest.webmanifest` del matcher: el navegador lo pide sin sesión (en `/ingresar`) y una redirección rompería la instalación.
- `/robots.txt` lo sirve `src/app/robots.ts` (texto plano, permite todo: las pantallas privadas ya redirigen sin sesión) y también está excluido del matcher. Sin eso, el proxy lo redirigía a `/ingresar` y Lighthouse marcaba SEO por recibir HTML.
- Pendiente: verificación manual en Android/Chrome ("Agregar a pantalla de inicio" y apertura sin barra del navegador); la hace una persona del grupo.

## Entorno local

- El Front corre en `http://localhost:3000` (`npm run dev`): es el único origen local que Back permite en CORS (`main.ts`). No usar el puerto 3001. Si se levanta Back en la misma máquina, Back usa otro puerto (variable `PORT`, por ejemplo `PORT=4000`) y `NEXT_PUBLIC_API_URL` apunta a ese puerto; si no, se usa la URL de Back en Render. CI también corre el Front en el puerto 3000.

## Contratos con la API

- `type Role = 'admin' | 'director' | 'teacher' | 'guardian'`.
- Requests autenticados: `Authorization: Bearer <access_token>` y `X-Institution-Id: <uuid>`.
- `GET /me` devuelve `{ profile: { id, fullName, phone }, memberships: [{ id, institutionId, institutionName, role }] }`.
- `GET /me/subjects` y `GET /me/courses` responden **solo al rol `teacher`**; `GET /me/students` solo a `guardian`. Las pantallas de otros roles muestran un aviso en vez de llamar a la API.
- `apiFetch<T>(path, init?)` en `src/lib/api.ts`: agrega `Authorization` (token de la sesión de Supabase) y `X-Institution-Id` (membresía activa, la fija `SessionProvider` con `setActiveInstitutionId`), usa `NEXT_PUBLIC_API_URL` y lanza `ApiError { status, message }` si la respuesta no es 2xx (`status: 0` si no hay conexión). Con **401** de cualquier pedido cierra la sesión y recarga a `/ingresar` una sola vez (aunque fallen varios pedidos a la vez). Un 2xx sin cuerpo devuelve `undefined`.
- Sesión: `SessionProvider` (`src/features/session/session-provider.tsx`) llama a `GET /me` y vive en `src/app/(panel)/layout.tsx`, no en el layout raíz (`/ingresar` no la usa). `useSession()` (`use-session.ts`) devuelve `{ profile, memberships, active }`; tipos y `ROLE_LABELS` en `types.ts`. La membresía activa es la última elegida o la primera (selector de M10). Un 401 de la API redirige a `/ingresar`. Si otra pestaña cambia de escuela (`BroadcastChannel`), se avisa con un toast y esta pestaña sigue en la suya.
- Menú: `getNavItems(role)` y `navItems` en `src/config/navigation.ts` (una línea por ítem; cada módulo agrega las suyas, previo aviso a UX); `studentTabs` en `src/config/student-tabs.ts` (hoy tiene "Notas" y "Asistencia"). Todo ítem apunta a una ruta que existe. "Calificaciones" es solo para `teacher` (la pantalla solo sirve al docente). "Mis cursos" (`/mis-cursos`, solo `teacher`) es una pantalla "Próximamente" con accesos a Calificaciones y Asistencia; sus textos provisorios están al principio de `src/app/(panel)/mis-cursos/page.tsx`.
- Header: en escritorio los ítems bajan de línea si no entran (sin scroll horizontal a 1024 px); el ítem queda activo también en sus subpantallas (`/alumnos/123`); el menú del celular se cierra con Escape y al cambiar de pantalla; todos los botones miden 44 px.
- `/inicio`: los números y listas son de ejemplo (`src/features/home/sample-data.ts`) y la pantalla lo avisa. Los accesos rápidos son los ítems del menú del rol (sin Inicio).
- Pantallas con sesión van dentro de `src/app/(panel)/` (header + menú por rol). `/` redirige a `/inicio`.

## Cómo se arman las pantallas (Next 16 con Cache Components)

- Cada `page.tsx` del panel es de servidor, con `export const instant = false;` (sin eso Next da el error "instant navigation") y solo renderiza un componente cliente. La lógica y los datos viven en `src/features/<módulo>/`.
- En rutas dinámicas (`[studentId]`) ni el layout ni la página leen `params` en el servidor: el componente cliente usa `useParams()`. El build lo marca `◐` (prerenderizado parcial).
- Los datos se piden con `apiFetch` dentro de un `useEffect` con `.then/.catch` y una bandera `cancelled`. No se llama a `setState` de forma síncrona dentro de un efecto (lo marca el lint): el "cargando" se deriva comparando una clave (por ejemplo `subjectId:periodId`) con la del último resultado. **La clave lleva la membresía activa** (`active.id`): si no, al cambiar de escuela la pantalla sigue mostrando datos de la anterior. Las respuestas que deberían ser listas se aseguran con `Array.isArray(...) ? ... : []` para que un `null` no rompa la pantalla.
- Todo componente de datos maneja los estados cargando (`SkeletonLines`), vacío (`EmptyState`), error con "Reintentar" (`ErrorState`) y éxito (toast).
- Componentes compartidos en `src/components/ui/`: `toast.tsx` (`ToastProvider` en el layout raíz y `useToast`), `confirm-dialog.tsx`, `skeleton.tsx`, `empty-state.tsx`, `error-state.tsx`, `save-bar.tsx` (barra de guardado de las planillas de notas y de asistencia).
- Para un cambio de pantalla con datos sin guardar se usa `useUnsavedChangesGuard` (`src/lib/use-unsaved-changes-guard.ts`) con `ConfirmDialog` ("Seguir editando" / "Salir sin guardar"). No puede frenar los botones atrás/adelante del navegador. Lo usan calificaciones, asistencia, el formulario de comunicados, la asignación docente y los datos de la escuela (`/escuela`).
- `ConfirmDialog` con `loading` no se cierra con Escape ni con clic en el fondo. `Modal` (`src/components/ui/modal.tsx`) no se cierra mientras haya una mutación de TanStack Query en curso (`useIsMutating`), y en celular lleva a la vista el campo enfocado para que el teclado no lo tape.
- **Sin doble envío en formularios con React Hook Form:** dentro de `handleSubmit` se usa `await mutation.mutateAsync(...)` (con `try/catch`; el error se muestra con `mutation.error`) y los botones van con `disabled={isSubmitting || mutation.isPending}`. Con `mutate()` hay un instante en que ninguno de los dos está en `true` y un doble toque envía dos veces. Fuera de RHF, un candado con `useRef`.
- Exportar o abrir un archivo que devuelve Back: `openPendingTab()` (`src/lib/pending-tab.ts`) abre la pestaña en el mismo clic y le pasa la URL después (`tab.open(url)` / `tab.close()` si falla). Un `window.open` después de un `await` lo bloquea el navegador.
- Fechas relativas ("Hoy", "Ayer", "hace X días") con el calendario de Argentina: `argentinaDayNumber` y `argentinaShortDateFormat` en `src/lib/argentina-time.ts`. Nunca con el huso horario del navegador.

## Calificaciones (M1)

- Código en `src/features/grades/`. Back entrega **una nota por alumno, materia y período** (no hay 3 notas ni promedio) y una **observación opcional** del docente por nota (`observations`, hasta 500 caracteres).
- Endpoints: `GET /me/subjects`, `GET /grading-periods`, `GET /grades?subjectId=&periodId=` (alumnos ya ordenados por apellido; `value` y `observations` pueden ser `null`), `PUT /grades` (`{ subjectId, periodId, entries: [{ studentId, value, observations? }] }` → `{ saved }`; ignora los `null`, no borra notas; `saved: 0` si no hubo cambios), `GET /students/:studentId/grades` (tutor, también trae `observations`).
- Escala 1 a 10, aprobación en 6 (supuesto de UX, a validar con la institución). Las reglas están en `grade-rules.ts`: validación (coma o punto, hasta 2 decimales), promedio con 1 decimal y semáforo (7 o más verde "Satisfactorio", 6 a 6,9 amarillo "Atención", menos de 6 rojo "Bajo", siempre con número y texto).
- La lógica de edición (`grade-drafts.ts`) y el resumen del tutor (`student-grades.ts`) son funciones puras con tests.
- Los errores de Back son técnicos ("subjectId inválido"): `use-save-grades.ts` y `use-student-grades.ts` muestran textos propios para 400, 403 y 404.
- Planilla del docente: `/calificaciones` (solo `teacher`). Portal del tutor: `/hijos` (lista) y `/hijos/[studentId]/notas` (solo `guardian`).
- Observaciones (`observation-input.tsx`, `grade-drafts.ts`): `observations` omitida conserva la anterior, `""` la borra y más de 500 caracteres da 400 (el Front no corta lo que se escribe: avisa con `role="alert"` y bloquea "Guardar"). Los espacios de los costados no cuentan como cambio y se recortan al enviar. Se mandan **solo en los alumnos que el docente tocó**.
- Si solo cambió la observación, el Front manda igual la nota que ya tenía: con `value: null` Back la dejaría en blanco. Un alumno sin nota puede tener observación (`value: null`).
- Pendiente de Back: guardar solo una observación hoy avisa "Nueva nota" a los tutores (emite `grades.saved` por cualquier cambio). Pendiente de UX: diseño del campo y del texto de la observación.

## Asistencia (M2)

- Código en `src/features/attendance/`. Estados que acepta Back: `present`, `absent`, `late` y `justified`, con letras P / A / T / J (`types.ts`). Los textos y colores de las etiquetas son provisorios hasta que UX los confirme.
- Endpoints: `GET /attendance?courseId=&date=YYYY-MM-DD` (una fila por alumno: `{ student: { id, firstName, lastName }, status }`, con `status: null` si todavía no se tomó lista), `PUT /attendance` (`{ courseId, date, entries: [{ studentId, status }] }` → `{ saved }`) y `GET /students/:studentId/attendance` (tutor: `{ records: [{ date, status }], summary: { present, absent, late, justified, percentage } }`, con `percentage: null` si no hay registros).
- Cursos para elegir: docente `GET /me/courses`; admin y director `GET /courses` (el tutor no toma lista).
- "Hoy" se calcula con la hora de Argentina y se vuelve a calcular al volver a la pestaña; si pasó la medianoche, la planilla abierta se queda en el día que se estaba mirando (con sus cambios) y "Ir a hoy" lleva al nuevo. No se puede tomar lista de una fecha futura. El botón "Todos presentes" no pisa a los alumnos que ya tienen un estado.
- Al guardar, el Front manda **solo los alumnos que cambió**: cada guardado vuelve a avisar a los tutores de los ausentes enviados, así que mandar toda la lista re-notificaría de más.
- Las reglas (`attendance-rules.ts`, `attendance-api.ts`, `student-attendance.ts`) son funciones puras con tests. Las pantallas son `attendance-sheet.tsx` y `attendance-student-row.tsx`, y para el tutor `student-attendance-screen.tsx` y `student-attendance-view.tsx`.
- Pantalla del docente y directivos: `/asistencia` (`teacher`, `admin`, `director`). Pestaña del tutor: `/hijos/[studentId]/asistencia` (solo `guardian`).

## Comunicados (M3)

- Código en `src/features/announcements/`. Pantalla `/comunicados` (todos los roles; el ítem del menú sigue llamándose "Avisos", el nombre final lo decide UX, y desde M3 lleva a `/comunicados`).
- Endpoints: `GET /announcements` (todos los roles, del más nuevo al más viejo: `{ id, scope, title, body, createdAt, author: { id, fullName }, course: { id, name } | null, student: { id, firstName, lastName } | null }`; `author.fullName` y `course.name` pueden venir `null`) y `POST /announcements` (`{ scope, courseId?, studentId?, title, body }`).
- La respuesta del `POST` es el registro crudo de la base (snake_case), **no** tiene la forma de la lista: después de publicar hay que volver a pedir `GET /announcements`.
- Quién ve qué (lo filtra Back, el Front no filtra): admin y director ven todo; el docente ve institución y sus cursos; el tutor ve institución, los cursos de sus hijos y los dirigidos a ellos.
- Quién publica (`allowedScopes` en `announcements-rules.ts`): admin y director en institución o curso; el docente solo en un curso donde dicta materias; el tutor nunca. Cursos para elegir: docente `GET /me/courses`; admin y director `GET /courses`.
- Alcances: el Front crea solo `institution` y `course`. El de `student` lo soporta Back, pero el Front no tiene lista de alumnos; si llega uno, se muestra en la lista.
- Back no tiene límites de largo, paginación, "leído", categorías, detalle, edición ni borrado. Un comunicado publicado no se puede editar ni borrar, y cada publicación puede avisar a los tutores: por eso el formulario pide confirmación y el hook de publicar ignora un segundo toque mientras el primero está en curso.
- El título tiene un máximo de 120 caracteres (lo pide UX; Back no lo valida, se valida en el Front). Los errores de Back son técnicos: no se muestran, se usan los textos propios de `announcements-api.ts`.
- El texto del comunicado se muestra siempre como **texto** (React lo escapa; `whitespace-pre-line` respeta los saltos de línea). Nunca `dangerouslySetInnerHTML`. La fecha se muestra en hora de Argentina (`formatDate`).
- Zona provisoria de UX: todos los textos y colores de comunicados que UX todavía no confirmó están en `announcements-ui.ts`. Cuando UX los defina se cambian solo ahí.
- Archivos: `types.ts` (tipos), `announcements-rules.ts` (reglas puras), `announcements-api.ts` (rutas, textos de error y conversión de las respuestas), `use-announcements.ts`, `use-announcement-courses.ts` y `use-publish-announcement.ts` (datos), `announcement-card.tsx` (tarjeta), `announcement-form-state.ts` y `announcement-form-fields.tsx` (formulario puro), `announcement-form.tsx` (formulario con estado) y `announcements-screen.tsx` (pantalla).
- Con texto sin publicar avisan el botón Cancelar, el cierre de pestaña y los enlaces del sitio (`useUnsavedChangesGuard`). Pendientes de UX: nombres de los alcances, etiqueta del menú, diseño del formulario, categorías y colores. Pendientes de Back: límites de largo.

## Notificaciones (M4)

- Código en `src/features/notifications/`. Bandeja `/notificaciones` (todos los roles) y campanita en el header (`AppHeader`) con el número de no leídas. No hay ítem en el menú: se entra por la campanita.
- Endpoints: `GET /notifications` (las 50 más nuevas: `{ id, title, body, type, link, studentId, readAt, createdAt }`, con `readAt: null` si no se leyó), `GET /notifications/unread-count` (`{ count }`), `POST /notifications/:id/read` (`{ success: true }`) y `POST /notifications/read-all` (`{ updated }`) y `DELETE /notifications/:id` (204; 404 si no existe o no es del usuario).
- Quién recibe (lo decide Back): solo los tutores, ante "Nueva nota", "Inasistencia registrada" y "Nuevo comunicado". Admin, director y docente ven la bandeja vacía y el contador en 0.
- Back manda `type` (`grade`, `attendance`, `announcement`, `general`), `link` y `studentId`. El destino al tocar se arma con `type` + `studentId` (`notificationHref` en `notifications-rules.ts`): nota → `/hijos/<id>/notas`, inasistencia → `/hijos/<id>/asistencia`, comunicado → `/comunicados`; sin alumno, `/hijos`. **`link` no se usa**: Back manda `/calificaciones` y `/asistencia`, que son pantallas del docente. Las notificaciones anteriores a la migración de Back vienen como `general`: para esas se usa `DESTINATION_BY_TITLE` (por título) y, si no coincide, `/notificaciones`.
- Contador: `NotificationsProvider` vive en `src/app/(panel)/layout.tsx`, dentro de `SessionProvider` (necesita la institución activa). Pide el contador al entrar y en cada cambio de pantalla; si falla, se queda con el último valor y no muestra error. `useUnreadCount()` lo comparten la campanita y la bandeja.
- Marcar leída (una, todas o al tocar la tarjeta): la pantalla y el contador cambian al instante, vuelven atrás si Back falla y después se pide el contador real. Un segundo toque mientras el primero está en curso se ignora.
- El número de la campanita llega hasta `99+`, pero el nombre accesible dice la cantidad real ("Notificaciones, 120 sin leer"). La no leída se marca con punto, fondo y el texto "No leído", nunca solo con color.
- Agrupación Hoy / Ayer / fecha y "Hace X minutos" con la hora de Argentina. Título y texto se muestran siempre como texto, nunca con `dangerouslySetInnerHTML`.
- Eliminar (botón "Eliminar" en cada tarjeta, `use-delete-notification.ts`): pide confirmación con `ConfirmDialog`, saca la notificación de la pantalla y del contador (si estaba sin leer) al instante y la vuelve a poner si Back falla. Con 404 (ya no existe) queda eliminada. Un segundo toque mientras el primero está en curso se ignora. Cada eliminación es definitiva: no hay deshacer.
- La campanita es un SVG propio (`bell-icon.tsx`): el proyecto no usa librería de íconos.
- Zona provisoria de UX: textos, colores, destinos y la campanita están en `notifications-ui.ts`. Cuando UX los defina se cambian solo ahí.
- Archivos: `types.ts`, `notifications-rules.ts` (reglas puras), `notifications-api.ts` (rutas, textos de error y conversión de las respuestas), `use-unread-count.ts` y `notifications-provider.tsx` (contador), `use-notifications.ts`, `use-mark-notifications.ts` y `use-delete-notification.ts` (datos), `notification-card.tsx`, `notifications-list.tsx` y `notification-bell-link.tsx` (dibujo, con tests), `notification-bell.tsx` y `notifications-screen.tsx` (con datos).
- Pendientes de Back: paginación (hoy solo llegan 50). Pendientes de UX: lugar y diseño de la campanita, colores de no leído, destinos, si va un ítem en el menú y el nombre de la escuela, que en 390 px se corta más con la campanita.

## Tablero de dirección (M5)

- Código en `src/features/dashboard/`. Pantalla `/tablero`, solo para admin y director (ítem "Tablero" en el menú). A docente y tutor la pantalla les muestra "Esta pantalla es para la dirección" (`canSeeDashboard`) y Back les responde 403.
- Endpoint: `GET /dashboard` → `{ students, courses, teachers, attendanceAverage, lowAttendance, gradeAverages }`. No recibe período.
- `attendanceAverage` es de todo el historial (presente + tarde sobre presente + tarde + ausente; las justificadas no cuentan) y puede venir `null`. `lowAttendance` son los alumnos con menos de 85% en los últimos 30 días, ordenados de menor a mayor. `gradeAverages` es el promedio por materia y curso (`average: null` si no hay notas), ordenado por materia y curso. El orden lo pone Back.
- Muestra: 4 números arriba (estudiantes, cursos, docentes, asistencia promedio), la lista de baja asistencia y los promedios por materia (tarjetas en celular, tabla en escritorio). En escritorio, la baja asistencia va en la columna lateral de 440 px del diseño. En celular va antes que los promedios.
- Formato es-AR: `1.847`, `92,5%`, promedio con 1 decimal (`7,0`). Rangos de promedio del PDF de M5-UX (supuesto a confirmar con Dirección): Sobresaliente desde 9, Satisfactorio desde 7, En riesgo desde 6 y Crítico debajo de 6. El rango siempre va con texto, nunca solo color.
- Alcance: solo lo que manda Back. Del PDF de M5-UX quedan afuera, hasta que Back los tenga: variación contra el período anterior y sparklines, selector de período, comunicados enviados, materias con riesgo, inasistencias acumuladas, gráficos de tendencia, distribución de notas, alertas, actividad reciente, acciones rápidas, reporte PDF y actualización automática. El PDF propone `GET /api/direccion/...`, que no existe.
- Zona provisoria de UX: textos y colores en `dashboard-ui.ts`. Cuando UX los defina se cambian solo ahí.
- Archivos: `types.ts`, `dashboard-api.ts` (ruta, textos de error y conversión de la respuesta), `dashboard-rules.ts` (reglas puras), `use-dashboard.ts` (datos), `kpi-card.tsx`, `dashboard-kpis.tsx`, `low-attendance-list.tsx`, `grade-averages-table.tsx` y `dashboard-view.tsx` (dibujo, con tests), `dashboard-screen.tsx` (con datos).

## Escuela, cursos y materias (M6)

- Código en `src/features/school/`. Pantallas `/escuela`, `/cursos`, `/cursos/[id]`, `/materias`, `/materias/[id]`, solo admin y director.
- Datos con TanStack Query (`src/lib/query-provider.tsx`, en el layout del panel). Las claves llevan el id de la escuela activa (`useInstitutionId()`), así al cambiar de escuela no se mezclan datos.
- Formularios con React Hook Form + Zod (`school-schemas.ts`); campos comunes en `src/components/ui/form-fields.tsx`; modales con Radix en `src/components/ui/modal.tsx` (hoja inferior en celular).
- Filtros y búsqueda en la URL; búsqueda con espera de 300 ms. Textos literales del SDD en `school-texts.ts` (M6 usa tuteo).
- Contratos de M6 a M10 alineados con la rama de Back `feat/frontend-full-contract-alignment` (`GET/PATCH /institution`, `PUT /institution/logo`, `GET /courses/:id`, estado de cursos y materias, etc.). Si un endpoint responde 404, la pantalla muestra "Esta función todavía no está disponible en el servidor." con Reintentar.
- "Asignar docente" abre un modal simple y ofrece "Abrir asignación completa" (`/docentes/asignacion?curso=&materia=`).
- Logo (`PUT /institution/logo`): mismos límites que Back, **PNG, JPG o SVG hasta 2 MB** (`LOGO_ACCEPTED_TYPES`, `LOGO_MAX_BYTES` en `school-texts.ts`). Se valida antes de subir con `logoFileError` (`school-rules.ts`). WebP no: Back lo rechaza.
- Las acciones de cursos y materias vacían también la caché de docentes (`["teachers", id]`), porque cambian su carga horaria.

## Alumnos (M7) y tutores (M9)

- Código en `src/features/students/` y `src/features/guardians/`. Pantallas `/alumnos` (filtros `q, curso, estado, turno, anio, orden, pagina` en la URL, 25 por página) y `/alumnos/[studentId]` (pestañas Ficha y Tutores).
- Back: `GET /students` (filtros `shift`, `schoolYear`, `sort`), `GET /students/:id/profile`, `POST/PATCH/DELETE /students`, `GET /students/:id/activity`, `GET /students/:id/report`, `/students/:id/guardians` (+ `make-primary`), `GET /guardians?q=` (buscar tutor), `POST /guardians` (reutiliza si ya existe por DNI o correo) y `PATCH /guardians/:membershipId`.
- Tutores: un solo principal activo; desvincular conserva el historial; inactivos ocultos por defecto. `GuardianCard` vive en `guardian-card.tsx` con imports relativos para poder testearlo.

## Docentes (M8)

- Código en `src/features/teachers/`. Pantallas `/docentes`, `/docentes/[id]` y `/docentes/asignacion` (M8 usa voseo).
- Back: `GET /teachers` (+ `counts`, `export`, `import`, `candidates`), `POST /teachers` (alta), `GET/PATCH /teachers/:id` (Back acepta también nombre, correo y teléfono; al editar, el Front deja legajo y correo en solo lectura y no los manda: `toTeacherEditPatch`), `GET /teachers/:id/activity`, `PUT /courses/:id/assignments`, `PUT /subjects/:id/teacher`.
- Reglas en `teachers-rules.ts`: máximo 30 hs (o `maxWeeklyHours`), inactivo no se asigna, licencia se asigna con aviso, sin choque de horario. Back también responde 409 por inactivo o límite. `conflict` de candidatos: el Front ignora los textos de estado y límite (los calcula él) y solo muestra el choque de horario.
- Asignación: los cambios se acumulan y se guardan juntos con `PUT /courses/:id/assignments`; si da 404 se usa `PUT /subjects/:id/teacher` por materia. Con cambios sin guardar, cambiar de curso o tocar un enlace pide confirmación. Mientras guarda, "Asignar" y "Quitar" quedan bloqueados. La caché se actualiza aunque falle (`onSettled`): el plan B por materia puede haber guardado una parte.

## Usuarios y selector de escuela (M10)

- Código en `src/features/users/` y `src/features/session/` (`institution-switch.ts`, `school-selector.tsx`). Pantalla `/usuarios`, solo admin (igual que Back).
- Back: `GET /users` (+ `counts`, `export`, filtro `lastAccess`), `POST /users`, `PATCH /users/:userId`, `POST /users/:userId/reset-password`, `PATCH /memberships/:id { role }`, `DELETE /memberships/:id` (baja lógica), `POST /memberships/:id/reactivate`. `blockedReason` se muestra en el detalle. `GET /me` trae `institutionStatus`, `city` y `level`, que se ven en el selector de escuela.
- Selector de escuela en el header (solo si hay más de una membresía): verifica con `GET /me`, cambia `X-Institution-Id`, vacía la caché de TanStack Query y recuerda la escuela en `localStorage` (`rededuca:escuela`). Rutas simples (`/usuarios`), no `/e/[slug]` del SDD.
- No se puede desactivar ni cambiar de rol al último administrador: `removesLastAdmin(users, activeAdmins, rows)` en `users-rules.ts` usa el total real de administradores activos (`useActiveAdminCount`: `GET /users?role=admin&status=active` → `total`), no solo la página visible. Back también responde 409. En el formulario de edición, el rol queda fijo (solo se ofrece el actual, con el motivo como ayuda).
- Nadie se cambia su propio rol ni se da de baja (`user.userId === profile.id`): se avisa con `SELF_CHANGE_TEXT`.
- Acciones en lote (rol, baja, reenviar acceso): se aplican con `Promise.allSettled`; si falla una parte, `PartialBatchError` avisa "Se aplicó a X de Y". La caché se actualiza siempre (`onSettled`). La selección se limpia al cambiar filtros o página, y exportar usa solo las filas visibles seleccionadas.

## Tests

- Vitest incluye `src/**/*.test.{ts,tsx}`. No hay `jsdom` ni `@testing-library`: los componentes se prueban con `renderToStaticMarkup` (de `react-dom/server`), por eso conviene separar la parte que solo dibuja (props) de la que pide datos.
- Playwright en local: los navegadores se instalan una vez con `npx playwright install chromium` (quedan fuera del repo); `npm run test:e2e` reutiliza el servidor del puerto 3000 si ya hay uno.
- Lighthouse: medir siempre sobre el build de producción (`npm run build` y `npm start`), en ventana privada, 3 corridas en modo celular, y comparar la mediana. En máquinas sin GPU, Chrome headless infla el TBT (se traba el primer cuadro): para comparar cambios ahí conviene contar las tareas largas con Playwright y la CPU 4× más lenta.
- `vitest.config.ts` define el alias `@/` → `src/` (alineado con `tsconfig.json`), aunque en componentes de dibujo puros conviene mantener imports relativos para facilitar su aislamiento.

## Flujo de trabajo

- Una tarea = un PR, siempre hacia `main`. Se mergea solo con CI en verde (lint, test, build y e2e) y aprobación de otro integrante.
- Las ramas se crean desde `origin/main` (`git switch -c <rama> origin/main`) y se suben con `git push -u origin <rama>`.
- Antes de cada commit: `git status -s` y confirmar que no hay archivos `.env*` ni de otra tarea.
- No crear ramas ni subir cambios sin acuerdo del grupo.

## Arreglos de QA

Correcciones aplicadas y verificadas (unit tests, lint y build en verde):

- [x] **M1 (Calificaciones - Borradores persistentes)**: Implementada persistencia local en `localStorage` (`src/features/grades/grade-draft-storage.ts`) separada por `usuario + escuela + materia + período` (con expiración a 30 días y poda automática de cambios ya guardados en Back vía `pruneDrafts`). Recuerda la última materia/período seleccionados y muestra aviso de recuperación al recargar o volver a entrar.
- [x] **M3 (Comunicados - Prevención de doble clic M3-F03)**: Sellado el bloqueo sincrónico en `use-publish-announcement.ts` hasta que se ejecute `reset()` (tras cerrar el formulario) y agregado soporte de `loadingLabel` (`"Publicando…"`) y `aria-busy` en `ConfirmDialog` (`src/components/ui/confirm-dialog.tsx`) para evitar envíos duplicados.
- [x] **M4 (Notificaciones - Panel lateral y zona horaria M4-F02)**:
  - En vistas de escritorio (`>= 1024px` / `lg`), la campanita abre un panel lateral deslizante (`src/features/notifications/notifications-drawer.tsx`) en lugar de navegar a pantalla completa, manteniendo la navegación directa a `/notificaciones` en móvil/tablet o con `Ctrl/Cmd + clic`.
  - Ajustada la constante `ARGENTINA_TIME_ZONE` en `notifications-rules.ts` a `"America/Argentina/Jujuy"` para el formateo y agrupación por día (`Hoy`, `Ayer`).
- [x] **M5 (Tablero - Restricción de acceso M5-02)**: Unificado el estado de acceso restringido (`DashboardNotAllowed` en `dashboard-screen.tsx`) tanto para bloqueo preventivo por rol (`teacher` / `guardian`) como para respuestas `403` del Back, ocultando el subtítulo institucional y agregando enlace de retorno (`Ir al inicio` → `/inicio`).
- [x] **Contratos API / Config**: Estandarizada la detección de `404` con `instanceof ApiError` en `src/features/teachers/use-teachers-data.ts` y configurado el alias `@/` en `vitest.config.ts`.
- [x] **Auditoría de Front (PR `fix/qa-auditoria-front`)**: recuperar contraseña con `/nueva-contrasena`; 401 global en `apiFetch`; cierre de sesión que no deja bucles; header sin desborde y accesible; datos de M1 y M2 por escuela activa; sin doble envío en los formularios de M6 a M10; modales y diálogos que no se cierran mientras guardan; logo validado; asignación docente con aviso de cambios; usuarios con lotes parciales, último admin real y sin cambio de rol propio; exportar sin bloqueo de ventanas emergentes; fechas con calendario de Argentina; colores hexadecimales pasados a tokens; "Mis cursos" con pantalla "Próximamente"; Inicio con aviso de datos de ejemplo. Next.js actualizado de 16.4.3 a 16.4.6 (con `eslint-config-next`) para corregir la vulnerabilidad que avisaba el build. Pendiente: probar en celular real.
- [x] **Lighthouse en `/ingresar`**: medido en Brave (celular, build de producción) pasó de Performance 89, Accesibilidad 96, Buenas prácticas 100 y SEO 91 a **95, 100, 100 y 100**. Cambios: formulario aparte (`LoginForm`) y página de servidor, Supabase con `import()` diferido, sin prefetch de "Recuperar contraseña" al aparecer, silueta con curvas Bézier (HTML de 212 a 152 KB), contraste de "Mostrar" y "Recuperar contraseña" y `robots.txt` como texto plano. Detalle en "Autenticación (B-09)" y "PWA instalable (B-11)".

## Historial QA

Controles de los checklists de QA (Notebook/Chrome, 12–18/11/2026, sobre https://redimpulso-g1.vercel.app) ya corregidos en el Front. Antes de tocar un control, buscarlo acá: si figura, no se vuelve a corregir. Todo está sin commit en `fix/qa-auditoria-front` hasta terminar M6 a M10.

### M6 · Escuela y cursos

- QA-M6-02 ✔ front: `/escuela` se rehidrata con la respuesta de `GET /institution` después de guardar y avisa con toast de éxito o de error (`school-screen.tsx`, `school-form.tsx`). Back guarda `schedule` desde `fix/qa-audit` (12/11).
- QA-M6-03 ✔ front: `/escuela` usa `useUnsavedChangesGuard` (enlaces de la app y `beforeunload`) con el `ConfirmDialog` de salida (`school-screen.tsx`; `school-form.tsx` avisa con `onDirtyChange`).
- QA-M6-06 ✔ front: eliminar un curso con `studentsCount > 0` muestra «Este curso tiene N estudiantes vinculados…» (`role="alert"`) y deshabilita Eliminar (`ConfirmDialog` con `warning` y `confirmDisabled`, `courses-screen.tsx`, texto en `school-texts.ts`). Back bloquea con 409 y su mensaje se muestra en un toast.

### M7 · Alumnos

- QA-M7-02 ✔ front: la búsqueda manda un DNI con puntos o espacios solo con dígitos (`normalizeSearchTerm` en `students-api.ts`; Back cambia los `.` por espacios y no coincidía). El legajo (`fileNumber`) se ve en la ficha y en la lista (debajo del DNI en escritorio, en la línea de datos en celular, `students-list.tsx`).
- QA-M7-05 ✔ front: «Generar informe» (CSV) ya no abre la URL sin verificarla: `useStudentReport` la descarga con `fetchVerifiedBlob` (`src/lib/verified-download.ts`) y la guarda con `saveBlob` (`informe-<alumno>.csv`), sin pestañas. Si falla: toast «No se pudo generar el informe.». Botón «Generando…» deshabilitado y con candado (`student-profile-screen.tsx`). El bucket `exports` es de Back (B-M7-05). Las exportaciones de Docentes y Usuarios siguen con `openPendingTab` y pueden tener el mismo 404.

### M8 · Docentes

- M8-N03 ✔ front: en «Editar docente», Legajo y Correo quedan en solo lectura (con la ayuda «No se puede cambiar al editar.») y no van en el PATCH (`toTeacherEditPatch`, `teacherEditSchema` en `teachers-schemas.ts`; `teacher-form-dialog.tsx`). En el alta siguen siendo editables. El toast al guardar y la recarga de los datos ya estaban. Decisión del grupo (18/11).
- M8-N07 ✔ front: el candidato inactivo muestra el motivo en texto («Docente inactivo…», `candidate-panel.tsx`). Límite y choque de horario ya estaban deshabilitados y con texto, y el borrador de la asignación no se pierde si Back falla. **Licencia se sigue pudiendo asignar con aviso**: decisión del grupo (18/11), no se deshabilita.

### M9 · Tutores

- QA-M9-01 / 04, 06 y 07 ✔ ya resueltos: «Agregar tutor» → «Tutor existente» (buscar + parentesco), «Marcar como principal» y «Desvincular» con confirmación ya existían; Back tiene todos los endpoints. La ficha es solo admin y director.
- QA-M9-08: **se deja como estaba** (decisión del grupo, 18/11). Desvincular al principal con otros tutores pide elegir el nuevo principal (Back lo exige); con el único principal, el diálogo explica y no deja confirmar.
- QA-M9-02 ✔ front: «Tutores y familia» de la Ficha usaba `GET /students/:id/profile` (sin parentesco, sin principal ni estado). Ahora usa la misma consulta que la pestaña Tutores (`useGuardianLinks`): principal real, secundario activo y «Relación: …» (`fichaGuardians` en `student-profile.tsx`). Mientras carga, los contactos del perfil con «—».
- QA-M9-03 ✔ front: «Contactar» (Ficha, botón «Contactar tutor» y tarjeta de la pestaña Tutores) es un `mailto:` codificado con asunto «Consulta sobre <alumno>» (`mailtoHref` en `students-rules.ts`), ya no `tel:`. «Copiar email» con toast (`guardian-contact.tsx`, `use-copy-email.ts`). Sin correo, «Contactar» queda deshabilitado; se mantiene «Sin teléfono». La lista de alumnos sigue con `tel:` en celular.
- QA-M9-05 ✔ front: tutor y parentesco ya eran obligatorios y el 409 de Back ya se mostraba; el buscador de «Tutor existente» no ofrece a los que tienen vínculo activo (`availableCandidates` en `guardians-rules.ts`). Los inactivos sí, para reactivarlos.
- QA-M9-09 ✔ front: «Marcando…» con `aria-busy` y candado `useRef` en «Marcar como principal» (`guardians-section.tsx`). Los demás estados de carga y toasts ya estaban.

### M10 · Usuarios

- QA-M10-03 ✔ front: Back manda `status` tal cual está en `memberships.status`, que mezcla los estados de M10 con los heredados de M8 (`activo`, `licencia`, `inactivo`; el seed quedó en `activo`). El Front solo leía los de M10 y mostraba «—». `parseUserStatus` (`users-api.ts`) lee `activo`/`licencia` como Activo e `inactivo` como Inactivo (igual que `ACTIVE_MEMBERSHIP_STATUSES` de Back). El filtro «Activo» y los contadores siguen sin incluir los heredados: es de Back (B-M10-03).
- QA-M10-09 ✔ front: con el arreglo anterior, el admin del seed ya se reconoce como activo. `removesLastAdmin` (`users-rules.ts`) nunca usa un total de Back menor que los admins activos que se ven en la lista (`GET /users?role=admin&status=active` no cuenta los `activo`). Baja, cambio de rol y formulario ya explicaban el bloqueo con texto (`LAST_ADMIN_TEXT`) y Back responde 409.

### Pendiente Back

- Sin cambios de código pendientes para M6: `schedule` (B-M6-02) y el 409 al eliminar un curso con alumnos (B-M6-06) ya están en `main` de Back. Falta confirmar que Render tenga desplegado ese `main`.
