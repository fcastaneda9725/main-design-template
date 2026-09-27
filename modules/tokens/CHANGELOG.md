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
