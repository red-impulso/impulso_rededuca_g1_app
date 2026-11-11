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

- El Front corre en `http://localhost:3000` (`npm run dev`): es el único origen local que Back permite en CORS (`main.ts`). No usar el puerto 3001. Si se levanta Back en la misma máquina, Back usa otro puerto (variable `PORT`, por ejemplo `PORT=4000`) y `NEXT_PUBLIC_API_URL` apunta a ese puerto; si no, se usa la URL de Back en Render. CI también corre el Front en el puerto 3000.

## Contratos con la API

- `type Role = 'admin' | 'director' | 'teacher' | 'guardian'`.
- Requests autenticados: `Authorization: Bearer <access_token>` y `X-Institution-Id: <uuid>`.
- `GET /me` devuelve `{ profile: { id, fullName, phone }, memberships: [{ id, institutionId, institutionName, role }] }`.
- `GET /me/subjects` y `GET /me/courses` responden **solo al rol `teacher`**; `GET /me/students` solo a `guardian`. Las pantallas de otros roles muestran un aviso en vez de llamar a la API.
- `apiFetch<T>(path, init?)` en `src/lib/api.ts`: agrega `Authorization` (token de la sesión de Supabase) y `X-Institution-Id` (membresía activa, la fija `SessionProvider` con `setActiveInstitutionId`), usa `NEXT_PUBLIC_API_URL` y lanza `ApiError { status, message }` si la respuesta no es 2xx (`status: 0` si no hay conexión).
- Sesión: `SessionProvider` (`src/features/session/session-provider.tsx`) llama a `GET /me` y vive en `src/app/(panel)/layout.tsx`, no en el layout raíz (`/ingresar` no la usa). `useSession()` (`use-session.ts`) devuelve `{ profile, memberships, active }`; tipos y `ROLE_LABELS` en `types.ts`. La membresía activa es la primera (el selector llega en M10-2). Un 401 de la API redirige a `/ingresar`.
- Menú: `getNavItems(role)` y `navItems` en `src/config/navigation.ts` (una línea por ítem; cada módulo agrega las suyas, previo aviso a UX); `studentTabs` en `src/config/student-tabs.ts` (hoy tiene "Notas" y "Asistencia").
- Pantallas con sesión van dentro de `src/app/(panel)/` (header + menú por rol). `/` redirige a `/inicio`.

## Cómo se arman las pantallas (Next 16 con Cache Components)

- Cada `page.tsx` del panel es de servidor, con `export const instant = false;` (sin eso Next da el error "instant navigation") y solo renderiza un componente cliente. La lógica y los datos viven en `src/features/<módulo>/`.
- En rutas dinámicas (`[studentId]`) ni el layout ni la página leen `params` en el servidor: el componente cliente usa `useParams()`. El build lo marca `◐` (prerenderizado parcial).
- Los datos se piden con `apiFetch` dentro de un `useEffect` con `.then/.catch` y una bandera `cancelled`. No se llama a `setState` de forma síncrona dentro de un efecto (lo marca el lint): el "cargando" se deriva comparando una clave (por ejemplo `subjectId:periodId`) con la del último resultado.
- Todo componente de datos maneja los estados cargando (`SkeletonLines`), vacío (`EmptyState`), error con "Reintentar" (`ErrorState`) y éxito (toast).
- Componentes compartidos en `src/components/ui/`: `toast.tsx` (`ToastProvider` en el layout raíz y `useToast`), `confirm-dialog.tsx`, `skeleton.tsx`, `empty-state.tsx`, `error-state.tsx`, `save-bar.tsx` (barra de guardado de las planillas de notas y de asistencia).
- Para un cambio de pantalla con datos sin guardar se usa `useUnsavedChangesGuard` (`src/lib/use-unsaved-changes-guard.ts`) con `ConfirmDialog` ("Seguir editando" / "Salir sin guardar"). No puede frenar los botones atrás/adelante del navegador.

## Calificaciones (M1)

- Código en `src/features/grades/`. Back entrega **una nota por alumno, materia y período** (no hay 3 notas ni promedio) y una **observación opcional** del docente por nota (`observations`, hasta 500 caracteres).
- Endpoints: `GET /me/subjects`, `GET /grading-periods`, `GET /grades?subjectId=&periodId=` (alumnos ya ordenados por apellido; `value` y `observations` pueden ser `null`), `PUT /grades` (`{ subjectId, periodId, entries: [{ studentId, value, observations? }] }` → `{ saved }`; ignora los `null`, no borra notas; `saved: 0` si no hubo cambios), `GET /students/:studentId/grades` (tutor, también trae `observations`).
- Escala 1 a 10, aprobación en 6 (supuesto de UX, a validar con la institución). Las reglas están en `grade-rules.ts`: validación (coma o punto, hasta 2 decimales), promedio con 1 decimal y semáforo (7 o más verde "Satisfactorio", 6 a 6,9 amarillo "Atención", menos de 6 rojo "Bajo", siempre con número y texto).
- La lógica de edición (`grade-drafts.ts`) y el resumen del tutor (`student-grades.ts`) son funciones puras con tests.
- Planilla del docente: `/calificaciones` (solo `teacher`). Portal del tutor: `/hijos` (lista) y `/hijos/[studentId]/notas` (solo `guardian`).
- Observaciones (`observation-input.tsx`, `grade-drafts.ts`): `observations` omitida conserva la anterior, `""` la borra y más de 500 caracteres da 400 (el Front no corta lo que se escribe: avisa con `role="alert"` y bloquea "Guardar"). Los espacios de los costados no cuentan como cambio y se recortan al enviar. Se mandan **solo en los alumnos que el docente tocó**.
- Si solo cambió la observación, el Front manda igual la nota que ya tenía: con `value: null` Back la dejaría en blanco. Un alumno sin nota puede tener observación (`value: null`).
- Pendiente de Back: guardar solo una observación hoy avisa "Nueva nota" a los tutores (emite `grades.saved` por cualquier cambio). Pendiente de UX: diseño del campo y del texto de la observación.

## Asistencia (M2)

- Código en `src/features/attendance/`. Estados que acepta Back: `present`, `absent`, `late` y `justified`, con letras P / A / T / J (`types.ts`). Los textos y colores de las etiquetas son provisorios hasta que UX los confirme.
- Endpoints: `GET /attendance?courseId=&date=YYYY-MM-DD` (una fila por alumno: `{ student: { id, firstName, lastName }, status }`, con `status: null` si todavía no se tomó lista), `PUT /attendance` (`{ courseId, date, entries: [{ studentId, status }] }` → `{ saved }`) y `GET /students/:studentId/attendance` (tutor: `{ records: [{ date, status }], summary: { present, absent, late, justified, percentage } }`, con `percentage: null` si no hay registros).
- Cursos para elegir: docente `GET /me/courses`; admin y director `GET /courses` (el tutor no toma lista).
- "Hoy" se calcula con la hora de Argentina. No se puede tomar lista de una fecha futura. El botón "Todos presentes" no pisa a los alumnos que ya tienen un estado.
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
- Pendiente: avisar al salir con texto sin publicar al tocar enlaces del menú (hoy solo avisa el botón Cancelar y el cierre de pestaña; se puede usar `useUnsavedChangesGuard`). Pendientes de UX: nombres de los alcances, etiqueta del menú, diseño del formulario, categorías y colores. Pendientes de Back: límites de largo.

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
- Lo que Back no tiene (`GET /institution`, logo, `GET /courses/:id`, estado de materia…) se pide igual: la pantalla muestra "Esta función todavía no está disponible en el servidor." con Reintentar. Los campos que Back no manda se ven "—".
- "Asignar docente" abre un modal simple y ofrece "Abrir asignación completa" (`/docentes/asignacion?curso=&materia=`).

## Alumnos (M7) y tutores (M9)

- Código en `src/features/students/` y `src/features/guardians/`. Pantallas `/alumnos` (filtros `q, curso, estado, turno, anio, orden, pagina` en la URL, 25 por página) y `/alumnos/[studentId]` (pestañas Ficha y Tutores).
- Back: `GET /students`, `GET /students/:id/profile`, `POST/PATCH/DELETE /students`, `/students/:id/guardians` (+ `make-primary`). Pedidos: actividad, informe PDF, `POST /guardians` y `PATCH /guardians/:id`.
- Tutores: un solo principal activo; desvincular conserva el historial; inactivos ocultos por defecto. `GuardianCard` vive en `guardian-card.tsx` con imports relativos para poder testearlo.

## Docentes (M8)

- Código en `src/features/teachers/`. Pantallas `/docentes`, `/docentes/[id]` y `/docentes/asignacion` (M8 usa voseo).
- Back: `GET /teachers`, `GET /teachers/:id`, `PATCH /teachers/:id`, `PUT /subjects/:id/teacher`, `GET /courses/:id/assignments`. Alta: `POST /users` con `role: teacher` y después `PATCH /teachers/:id`.
- Reglas en `teachers-rules.ts`: máximo 30 hs (o `maxWeeklyHours`), inactivo no se asigna, licencia se asigna con aviso, sin choque de horario. Back todavía no las valida. El medidor de carga siempre lleva texto.
- Asignación: los cambios se acumulan y se guardan juntos con `PUT /courses/:id/assignments` (pedido); si da 404 se usa `PUT /subjects/:id/teacher` por materia.

## Usuarios y selector de escuela (M10)

- Código en `src/features/users/` y `src/features/session/` (`institution-switch.ts`, `school-selector.tsx`). Pantalla `/usuarios`, solo admin (igual que Back).
- Back: `GET /users`, `POST /users`, `PATCH /memberships/:id { role }`, `DELETE /memberships/:id` (baja lógica). Pedidos: contadores, editar datos, restablecer contraseña, reactivar, exportar, filtro de último acceso.
- Selector de escuela en el header (solo si hay más de una membresía): verifica con `GET /me`, cambia `X-Institution-Id`, vacía la caché de TanStack Query y recuerda la escuela en `localStorage` (`rededuca:escuela`). Rutas simples (`/usuarios`), no `/e/[slug]` del SDD.
- No se puede desactivar ni cambiar de rol al último administrador (`isLastAdmin`); Back también responde 409.

## Tests

- Vitest incluye `src/**/*.test.{ts,tsx}`. No hay `jsdom` ni `@testing-library`: los componentes se prueban con `renderToStaticMarkup` (de `react-dom/server`), por eso conviene separar la parte que solo dibuja (props) de la que pide datos.
- `vitest.config.ts` no define el alias `@/`: en los tests se importa con rutas relativas y se evita importar módulos que traigan `@/lib/api` (usar `import type`).
- Un componente que se prueba con `renderToStaticMarkup` no puede importar con `@/` (ni de forma indirecta). Por eso los componentes de dibujo (`announcement-card.tsx`, `announcement-form-fields.tsx`) solo importan con rutas relativas, y los que usan `@/` (`announcements-screen.tsx`, `announcement-form.tsx`, los hooks) no llevan test.

## Flujo de trabajo

- Una tarea = un PR, siempre hacia `main`. Se mergea solo con CI en verde (lint, test, build y e2e) y aprobación de otro integrante.
- Las ramas se crean desde `origin/main` (`git switch -c <rama> origin/main`) y se suben con `git push -u origin <rama>`.
- Antes de cada commit: `git status -s` y confirmar que no hay archivos `.env*` ni de otra tarea.
- No crear ramas ni subir cambios sin acuerdo del grupo.
