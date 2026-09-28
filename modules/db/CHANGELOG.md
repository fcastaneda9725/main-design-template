# db — CHANGELOG

Formato: `vN  severidad  síntoma`. Severidad: `fix-seguridad` / `fix` / `feat` / `chore`.
Solo las dos primeras justifican interrumpir un proyecto que ya lo tiene instalado
(ver `PLAN.md` D12 — la auditoría reporta, nunca actualiza sola).

## v1 — 2026-09-27

- **feat** Primera versión. Extraído de `zazpi` (`db/index.ts`, patrón de
  `drizzle.config.ts` con `dotenv` propio) y verificado de extremo a extremo en
  la app real: `npm run db:generate` reconoce el schema vacío, y quitar
  `DATABASE_URL` de `.env.local` con algo importando `db` hace fallar el build
  con el mensaje de `lib/env.ts` (confirma que `base`+`db` fallan rápido de
  verdad, no solo en la documentación).
- **feat** Driver **`neon-http`**, no el de sesión (Pool/WebSocket). Decisión
  respaldada por dos proyectos reales que discrepan en la razón pero coinciden
  en el resultado: `zazpi` (sin auth todavía) lo usa por ser serverless-friendly
  y anota que "el driver de sesión entra en fase 2 para todo lo autenticado";
  `solvo` (con better-auth + `drizzleAdapter` en producción) usa **el mismo
  `neon-http`** para todo, auth incluida, y funciona. La nota de `zazpi` resultó
  ser precaución sin probar, no una limitación real — se documenta el escape
  hatch (Pool/sesión) para transacciones multi-sentencia reales, no para auth.
- **feat** Convención: **un archivo por tabla en `db/schema/`** con barrel
  `index.ts` (patrón de `zazpi`), no un `schema.ts` monolítico. Nota honesta:
  `solvo` — el proyecto más grande auditado, 188 commits, 41 tablas — usa un
  único `schema.ts` de 1026 líneas y funciona. No se adoptó ese patrón porque
  (a) el flujo de migraciones real de `solvo` corre por el CLI de Supabase, no
  por `drizzle-kit` — es un proyecto a medio migrar, no el estado limpio que
  este módulo representa, y (b) partir un archivo de 1000 líneas después es más
  caro que empezar dividido. Si un proyecto real demuestra que el archivo único
  también funciona a esa escala con `drizzle-kit` nativo, es motivo para
  reabrir esta decisión — no antes.
- **feat** `db/schema/index.ts` se instala vacío a propósito. Ninguna tabla de
  ejemplo — una tabla inventada es la primera línea que cualquier proyecto
  borra, no sobre la que construye.
- **chore** Requiere editar `lib/env.ts` (`base`) a mano para agregar
  `DATABASE_URL` a `serverSchema` — la instalación por archivos del registro no
  puede parchear un archivo existente. `/main-design-add` debería automatizar
  esto cuando exista; hasta entonces es un paso manual documentado en
  `SKILL.md`.
- **fix** (encontrado al construir `auth`, corregido antes de tener consumidores
  reales — se ajusta esta misma v1 en vez de abrir una v2 sin motivo) el pin
  original de `drizzle-orm@^0.44.7` (versión real de `zazpi`) es incompatible
  con `better-auth`, que exige `drizzle-orm@^0.45.2` como peer dependency
  cuando se usa `drizzleAdapter` — confirmado tanto por el `ERESOLVE` real de
  npm como por el `package.json` de `solvo` (el único proyecto que combina
  ambos), que fija `^0.45.2`. Subido a `^0.45.2`. Si un proyecto instala `db`
  sin `auth`, esto no cambia nada observable — sigue siendo la misma API de
  Drizzle que usa `zazpi`.
