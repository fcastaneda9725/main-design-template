---
name: db
description: Reglas de uso de Neon + Drizzle instalado en este proyecto (db/index.ts, db/schema/, drizzle.config.ts). Se activa al definir una tabla, escribir una query, o tocar una migración.
---

# db

Neon (Postgres) + Drizzle ORM, driver `neon-http`. `db/schema/index.ts` es un
barrel — las tablas viven en `db/schema/<tabla>.ts`, un archivo por tabla.

## Reglas duras

1. **Nunca definir una tabla en `db/schema/index.ts`.** Es solo
   `export * from "./<tabla>"`. Una tabla nueva es un archivo nuevo.
2. **Toda migración se genera con `npm run db:generate` y se revisa antes de
   aplicar** (`npm run db:migrate`). Nunca `drizzle-kit push` contra
   producción — Neon funciona por rama: una rama de base de datos por PR o
   preview, `main` es producción. Si el proyecto no tiene esa configuración de
   ramas en Neon todavía, es una tarea pendiente, no una excusa para usar
   `push`.
3. **`drizzle.config.ts` no se toca para apuntar a otra fuente de env.** Carga
   su propio `.env.local` con `dotenv` porque `drizzle-kit` corre fuera del
   proceso de Next.js — no puede importar `lib/env.ts` directamente.
4. **`DATABASE_URL` vive en `lib/env.ts` (`serverSchema`), no se lee
   `process.env.DATABASE_URL` suelto en el código de la app.** Si al instalar
   este módulo `lib/env.ts` no tiene `DATABASE_URL`, agregarlo a mano — la
   instalación por archivos no puede editar un archivo existente.
5. **El driver es `neon-http`, no Pool/WebSocket**, incluso con auth instalado
   encima (better-auth + `drizzleAdapter` funciona sobre `neon-http` en
   producción). Cambiar al driver de sesión solo si el proyecto necesita
   transacciones multi-sentencia reales que `neon-http` no soporte bien — no
   por precaución sin un caso concreto.
6. **Dinero y fechas siguen la convención de `AGENTS.md`** (de `base`): enteros
   en unidad menor + `currency` explícito, nunca `float`; `timestamptz`, nunca
   `timestamp` sin zona.

## Qué NO trae `db`

- Ninguna tabla de ejemplo — el schema instala vacío.
- Ningún ORM alternativo ni capa de abstracción sobre Drizzle (D06: sin
  variación observada en el portafolio, no se abstrae).
- Configuración de ramas de Neon en el dashboard — eso es infraestructura del
  proyecto, no código que el registro pueda instalar.
