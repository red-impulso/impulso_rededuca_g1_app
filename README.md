# impulso_rededuca_g1_app

Aplicación web (Next.js, App Router, TypeScript, Tailwind) para docentes y familias.
Creado por alumnos de IES Nº 6 de Perico, Jujuy, Argentina.

## Requisitos

- Node.js 22
- `cp .env.example .env.local` y completar las variables

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run build` | Build de producción |
| `npm run test:e2e` | Tests end-to-end (Playwright); la primera vez correr `npx playwright install chromium` |

## CI

`.github/workflows/ci.yml` corre en cada PR y en `main`: lint, Vitest, build y Playwright.

## Estructura

- `src/app/layout.tsx`: layout raíz con `<SiteFooter />`
- `src/components/layout/site-footer.tsx`: pie con la leyenda del grupo
- `e2e/`: tests de Playwright
