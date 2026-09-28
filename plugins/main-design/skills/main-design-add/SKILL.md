---
name: main-design-add
description: Instala un módulo del registro main-design en el proyecto actual y hace el cableado que la copia de archivos no puede (env vars, barrel exports, migraciones). Se activa cuando el usuario quiere agregar db, auth, email, tokens, payments u otro módulo del kit a un proyecto existente.
---

# main-design-add

Instala un módulo y completa lo que `npx shadcn add` no puede automatizar.
Cada módulo documenta sus propios pasos manuales en su `SKILL.md` — esta
skill los ejecuta, no los redefine.

## 1. Confirmar el registro

Si `components.json` no tiene `registries.main` (`D13`), agregarlo primero
— ver la sección 3 de `main-design-start`. No literal el token, siempre
`${REGISTRY_TOKEN}`.

## 2. Instalar

```bash
npx shadcn add @main/<módulo>
```

El CLI resuelve `registryDependencies` solo — instalar `auth` arrastra `db`
automáticamente, no hace falta pedirlos por separado. No correr `add` de un
módulo y de su dependencia en paralelo.

## 3. Cableado manual

Después de copiar archivos, el proyecto tiene un nuevo
`.claude/skills/<módulo>/SKILL.md` (el registro lo instala como cualquier
otro archivo del módulo). **Leerlo** — trae la lista exacta de ediciones
manuales para ese módulo. Patrones ya conocidos, como referencia (la lista
real vive en cada `SKILL.md`, no aquí, porque módulos futuros definirán la
suya):

- `db` → agregar `DATABASE_URL` a `serverSchema` en `lib/env.ts`.
- `auth` → agregar `BETTER_AUTH_SECRET` a `lib/env.ts` (`z.string().min(32)`,
  generar con `openssl rand -base64 32`) y `export * from "./auth";` a
  `db/schema/index.ts`.
- `email` → si `auth` ya está instalado, reemplazar el stub
  `sendResetPasswordEmail` en `lib/auth/server.ts` por el envío real.

## 4. Migraciones

Si el módulo trae schema nuevo, correr:

```bash
npm run db:generate
```

**No correr `npm run db:migrate` sin confirmar con el usuario primero** —
toca una base de datos real y no es reversible sin backup. Generar la
migración y mostrarla es seguro; aplicarla no lo es por defecto.

## 5. Marca de versión (`D12`)

Cada archivo instalado debería abrir con:

```
// kit: <módulo>@vN · <hash corto> · <fecha>
```

- `N` = el `## vN` más alto en `modules/<módulo>/CHANGELOG.md` dentro del
  repo `main-design-template`.
- hash corto = `git -C <ruta del kit> log -1 --format=%h -- modules/<módulo>`.

Si el repo del kit no está accesible localmente ni publicado todavía en
GitHub (ver `PLAN.md` §8 tarea 1, pendiente), decirlo explícitamente en vez
de inventar un hash — dejar la marca sin hash es preferible a una marca
falsa, porque `main-design-audit` confía en que ese dato es real.

## 6. Verificación

```bash
npm run build
npx tsc --noEmit
```

Y el caso negativo si el módulo depende de una env var nueva: quitarla
temporalmente y confirmar que el build falla con el mensaje de `lib/env.ts`
(no con un error genérico) — es la señal de que el módulo está bien cableado
a `base`, no solo copiado.

## 7. Reportar

Al usuario: qué se instaló, qué env vars quedaron con placeholder esperando
un valor real, y si se generó una migración sin aplicar.

## Qué NO hace esta skill

- No actualiza un módulo ya instalado — eso es lo que reporta
  `main-design-audit`, y solo reporta, nunca actualiza sola (`D12`).
- No decide abstracciones nuevas — si el módulo pedido no existe en el
  catálogo, es trabajo de `main-design-extract`, no de esta skill.
