# base — CHANGELOG

Formato: `vN  severidad  síntoma`. Severidad: `fix-seguridad` / `fix` / `feat` / `chore`.
Solo las dos primeras justifican interrumpir un proyecto que ya lo tiene instalado
(ver `PLAN.md` D12 — la auditoría reporta, nunca actualiza sola).

## v1 — 2026-09-27

- **feat** Primera versión. Extraído y generalizado de código en producción:
  - `lib/env.ts` — motor de validación server/client con Zod, patrón de `zazpi`
    (fail-fast al arrancar, `NEXT_PUBLIC_*` con acceso estático literal).
    **Requiere Zod v4** (`z.treeifyError`, `z.email()` no existen en v3).
  - `lib/errors/reference-code.ts` — código de referencia de 8 caracteres,
    alfabeto sin ambigüedad al dictarlo por teléfono, con variante determinista
    desde el `digest` de Next.js (extraído casi verbatim de `zazpi`, ya era
    genérico).
  - `instrumentation.ts` + `app/error.tsx` — el boundary de error y el hook de
    servidor comparten el mismo código de referencia sin transportar estado
    entre los dos. Generalizado quitando la dependencia dura de PostHog y de
    next-intl (ambos son responsabilidad de módulos que el proyecto puede no
    tener instalados todavía).
  - `components/states/{empty,error,forbidden}-state.tsx` — los tres estados
    que `zazpi/CLAUDE.md` exige en toda vista, nunca antes construidos como
    componentes reusables (vivían solo como regla en prosa).
  - `AGENTS.md` — plantilla híbrida (D04): secciones invariantes llenas,
    secciones de dominio marcadas `TODO(proyecto)`.
- **feat** `components/states/*` usan `Button` de shadcn vía
  `registryDependencies`, no un botón propio — primera comprobación real de que
  el registro puede arrastrar componentes oficiales en la misma instalación (D02).
- **chore** (encontrado al scaffoldear un proyecto real por primera vez)
  `base` traía su propio `lib/utils.ts` (`cn()` con `clsx`+`tailwind-merge`,
  igual en los 18 proyectos auditados). El CLI actual de shadcn (v4.21) ya
  escribe `lib/utils.ts` como `export { cn } from "cn"` al correr `init` —
  dos archivos distintos compitiendo por la misma ruta. Como `/main-design-start`
  siempre corre `shadcn init` antes de instalar `base`, se quitó el `lib/utils.ts`
  propio y las dependencias `clsx`/`tailwind-merge`: `base` ahora asume que
  `cn()` ya existe cuando se instala.
