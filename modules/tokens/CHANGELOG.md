# tokens — CHANGELOG

Formato: `vN  severidad  síntoma`. Severidad: `fix-seguridad` / `fix` / `feat` / `chore`.
Solo las dos primeras justifican interrumpir un proyecto que ya lo tiene instalado
(ver `PLAN.md` D12 — la auditoría reporta, nunca actualiza sola).

## v1 — 2026-09-27

- **feat** Extraído del pipeline de `zazpi` (`design-system/tokens.json` →
  `scripts/generate-tokens.mjs` → `src/styles/tokens.css`, con test de drift en
  Vitest). Generalizado: valores de marca reemplazados por un placeholder neutro
  — sustituir `design-system/tokens.json` por la paleta real del cliente antes de
  construir sobre el proyecto.
- **feat** Agregada la capa de alias de shadcn (D09), que no existía en el
  original de `zazpi`: los tokens propios son la fuente, `--background`,
  `--primary`, `--muted-foreground`, etc. se derivan de ellos.
- **fix** (encontrado durante la extracción, nunca llegó a producción) el nombre
  `--accent` colisionaba: es a la vez el color de marca propio y el nombre
  reservado de shadcn para "resalte sutil" — dos conceptos distintos con el mismo
  nombre de variable CSS en el mismo `:root`. La declaración de shadcn
  sobrescribía en silencio el color de marca. Se renombró el token propio a
  `--brand` / `--brand-hover` / `--brand-quiet`; las clases de Tailwind
  (`bg-accent`, `text-accent`) no cambian, solo la variable subyacente.
- **feat** (encontrado al escafoldear un proyecto real con `shadcn init`)
  agregado el alias `--font-heading: var(--font-display)` — el CLI actual
  (v4.21) genera ese token y lo usa `@theme inline`; sin alias quedaba vacío.
- **fix** verificado con un build real de Next.js que el reset
  `--color-*: initial` funciona como se documentó: `bg-red-600` forzado en una
  página compila sin error, pero Tailwind no genera ninguna regla para esa
  clase — el elemento queda visiblemente sin color. Se corrigió la redacción
  de este `CHANGELOG` y del `SKILL.md`, que decían "error de build" (impreciso:
  el build no falla, la clase simplemente no existe).
- **chore** documentado, no resuelto: el CLI actual también expone `--chart-1`
  a `--chart-5` (paleta categórica para gráficas) y `--sidebar*` (superficie de
  navegación lateral), ninguno aliasado todavía — y deriva `--radius-xl` a
  `--radius-4xl` multiplicando un solo `--radius`, mientras este módulo usa una
  escala fija de 6 pasos (decisión de `zazpi`: esquinas rectas, sin esos
  pasos). Si un componente de shadcn instalado después usa `rounded-xl` o
  superior, o clases `chart-*`/`sidebar-*`, y se ve sin estilo: extender
  `tokens.json`, no adivinar en el generador.
- **chore** `shadcn init` scaffoldea `next-themes` + un `ThemeProvider` con
  toggle claro/oscuro por clase (atajo de teclado incluido). Este módulo asume
  un solo tema por marca sin alternancia en runtime (D03) — el toggle se quitó
  del proyecto de referencia al integrar `tokens`+`base` por primera vez.
  `@custom-variant dark (&:is(.dark *))` se mantiene a propósito en
  `app/globals.css`: como nada aplica la clase `.dark`, neutraliza cualquier
  `dark:` que traiga un componente de shadcn en vez de dejarlo reaccionar a
  `prefers-color-scheme` del sistema. Si un proyecto sí necesita alternancia
  real, es una desviación explícita de D03 a documentar en su `AGENTS.md`, no
  algo que `tokens` soporte por defecto.
