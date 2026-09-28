---
name: auth
description: Reglas de uso de better-auth instalado en este proyecto (lib/auth/server.ts, lib/auth/client.ts, db/schema/auth.ts). Se activa al tocar login, sesión, roles, o el flujo de reset de contraseña.
---

# auth

better-auth con `drizzleAdapter`, plugin `admin()` para roles. Solo cableado —
las pantallas de login, registro y reset son del proyecto, no de este módulo.

## Reglas duras

1. **Nunca construir un link de reset con la `url` que entrega better-auth.**
   `sendResetPassword` en `server.ts` ya arma el link directo con el `token`
   crudo (`${NEXT_PUBLIC_APP_URL}/reset-password?token=...`). La `url` de
   better-auth pasa por su propio endpoint de redirect, que queda atrapado en
   el frame sandboxed de varios clientes de correo al hacer click — bug real,
   ya ocurrió en producción. Si se toca este archivo, no reintroducirlo.
2. **`db/schema/auth.ts` no se edita a mano.** Se regenera con
   `npx @better-auth/cli generate --config lib/auth/server.ts` cuando se
   agrega un plugin que necesite campos o tablas nuevas (`organization`,
   `twoFactor`, etc.) — luego se reconcilia el diff a mano si hace falta.
   Editarlo directo arriesga desincronizarlo de lo que better-auth espera leer
   y escribir ahí.
3. **Las columnas de tiempo de `db/schema/auth.ts` son `timestamp`, no
   `timestamptz`** — excepción deliberada a la convención del resto del
   proyecto (`AGENTS.md`), porque better-auth generó ese schema y lee/escribe
   esas columnas con esa expectativa. No "corregirlas" para que cumplan la
   convención general.
4. **`sendResetPasswordEmail` en `server.ts` es un stub** (hace `console.log`).
   Reemplazar su cuerpo por el envío real al instalar el módulo `email` — no
   duplicar `server.ts` ni envolverlo desde otro archivo.
5. **`requestPasswordResetLink(email)` es para flujos de admin/webhook**, no
   para el "olvidé mi contraseña" público (ese ya está resuelto por
   `sendResetPassword`). Úsalo cuando algo del lado servidor necesita el link
   sin que se envíe un correo — un webhook de pago que lo incluye en su propio
   mensaje, un panel de admin que lo muestra una vez.
6. **`createUserWithPassword` es para altas fuera del flujo público** (un
   admin invitando a alguien, un script de semilla). Devuelve `Result<string>`
   — revisar `ok`/`error`, nunca asumir éxito.
7. **Instalación requiere dos ediciones manuales** que la copia de archivos no
   puede hacer sola (mismo límite que `db`):
   - Agregar `BETTER_AUTH_SECRET` a `serverSchema` en `lib/env.ts`
     (`z.string().min(32)` — generar con `openssl rand -base64 32`).
   - Agregar `export * from "./auth";` a `db/schema/index.ts`.
8. **`socialProviders` viene comentado.** Descomentar y agregar las variables
   correspondientes a `lib/env.ts` solo si el proyecto pide login social — no
   es parte del cableado por defecto.

## Qué NO trae `auth`

- Ninguna pantalla — login, registro, olvidé-contraseña, reset. Eso es del
  proyecto, sobre los tokens semánticos de `theme-<cliente>`.
- Envío real de emails — depende del módulo `email`.
- Login social activo — el patrón está, comentado, sin credenciales.
