# auth — CHANGELOG

Formato: `vN  severidad  síntoma`. Severidad: `fix-seguridad` / `fix` / `feat` / `chore`.
Solo las dos primeras justifican interrumpir un proyecto que ya lo tiene instalado
(ver `PLAN.md` D12 — la auditoría reporta, nunca actualiza sola).

## v1 — 2026-09-27

- **feat** Primera versión. **Fusión de `solvo` + `landing-golf`** (D05 de
  `PLAN.md`) — ninguno de los dos archivos originales era, solo, el módulo:
  - De `solvo`: `drizzleAdapter`, `session.cookieCache` (30s), `trustedOrigins`,
    patrón de `socialProviders.google` (comentado, no activo por defecto).
  - De `landing-golf`: el plugin `admin({ defaultRole: "user" })` para roles
    (se usa este en vez del `additionalFields.role` manual de `solvo`, porque
    el plugin ya gestiona `banned`/`banReason`/`banExpires` — más completo, y
    es la decisión que `PLAN.md` D05 ya había fijado), `getSession(headers)`,
    y el patrón de capturar el link de reset sin enviar correo
    (`requestPasswordResetLink`, generalizado de `generatePasswordResetUrl` —
    se le quitó el nombre "golf" y la lógica de `redirectTo` específica).
  - **El fix real que motivó la fusión**: `solvo` construye el link de reset
    con el `token` crudo (`${appUrl}/nueva-contrasena?token=...`), nunca la
    `url` que arma better-auth — esa URL pasa por su propio endpoint de
    redirect, que queda atrapado en el frame sandboxed de varios clientes de
    correo al hacer click. `landing-golf` SÍ tenía ese bug (usaba la `url` de
    better-auth directo). El módulo aplica el fix de `solvo` en **ambas**
    rutas — email directo al usuario y captura para admin/webhook — así el
    bug no puede reaparecer en una de las dos como reapareció en `landing-golf`.
  - Descartado de `landing-golf`: `getOrCreateAuthUser`/`createStaffUser` (SQL
    crudo con `sql\`...\``, específico de "taquilla"/golf) — generalizado a un
    único `createUserWithPassword(email, name, password)` usando el `db` de
    Drizzle en vez de SQL crudo, devolviendo `Result<string>` (`base`) en vez
    de un `Promise` que no distingue error de éxito.
  - Descartado de `solvo`: `additionalFields.role` con `defaultValue: 'student'`
    (específico del dominio de `solvo`) — reemplazado por el plugin `admin()`.
- **feat** Schema de `user`/`session`/`account`/`verification` en
  `db/schema/auth.ts` **generado con la CLI oficial de better-auth**
  (`@better-auth/cli generate`), no escrito a mano ni copiado de ninguno de los
  dos proyectos — es la única forma confiable de que coincida exactamente con
  lo que el plugin `admin()` necesita. Verificado con un build real de
  `drizzle-kit generate`: reconoce las 4 tablas y genera una migración SQL
  válida.
- **fix-seguridad** El pin inicial (`better-auth@1.6.20`, versión exacta
  verificada en `landing-golf`) tiene un aviso de seguridad **alto**
  (GHSA-qq9h-g4jm-xgf3, "pre-account hijacking" vía magic-link/email-OTP),
  confirmado con `npm audit` y con el detalle del advisory. **Esta
  configuración no está expuesta** — el módulo no habilita magic-link ni
  email-OTP, ambos requeridos para el vector de ataque. Aun así, se subió a
  `1.6.22` (el patch que lo corrige, misma línea 1.6.x, sin cambios de schema
  verificados con un diff real entre ambas versiones) en vez de dejar fijada
  una versión con CVE conocido: un proyecto que agregue magic-link después
  sobre este módulo heredaría la exposición en silencio si no se corrige acá.
- **chore** El pin de `db`'s `drizzle-orm` (`^0.44.7`, de `zazpi`) es
  incompatible con `better-auth` como peer dependency (exige `^0.45.2`,
  confirmado con el `ERESOLVE` real de npm y con el `package.json` de `solvo`).
  Subido en `modules/db` — ver su propio `CHANGELOG.md`. Efecto en cascada:
  `vitest` también tuvo que subir de `^2.1.0` a `^4.1.10` (versión real que usa
  `solvo`, el único proyecto que combina vitest + better-auth) porque la
  versión anterior traía un `vite` incompatible con un peer opcional de
  better-auth.
- **chore** Requiere dos ediciones manuales que la copia de archivos del
  registro no puede automatizar (mismo límite que `db`, ver su `CHANGELOG`):
  agregar `BETTER_AUTH_SECRET` a `serverSchema` en `lib/env.ts`, y agregar
  `export * from "./auth";` a `db/schema/index.ts`. Documentado en `SKILL.md`.
- **chore** Verificado con dos casos negativos reales, no solo el camino
  feliz: quitar `BETTER_AUTH_SECRET` de `.env.local` con `lib/auth/server.ts`
  importado hace fallar el build con el mensaje de `lib/env.ts`; `npm run
  db:generate` con el schema instalado reconoce las 4 tablas y genera SQL
  válido.
- **feat** `lib/auth/client.ts` incluye `adminClient()` (de
  `better-auth/client/plugins`), emparejado con el plugin `admin()` del
  servidor — sin él, `useSession()` sigue funcionando pero pierde el tipado de
  `role`/`banned` en el cliente. Ninguno de los dos proyectos fuente lo tenía
  (ninguno de los dos combinaba `admin()` + cliente tipado); se agregó porque
  es la forma correcta documentada por better-auth, no una copia directa.

## Sin UI

Este módulo no trae pantallas de login/registro/reset — es una decisión
explícita de `PLAN.md` D05: la UI depende de la marca del cliente, el cableado
no. Ver `modules/auth/SKILL.md`.
