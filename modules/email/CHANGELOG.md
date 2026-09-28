# email — CHANGELOG

Formato: `vN  severidad  síntoma`. Severidad: `fix-seguridad` / `fix` / `feat` / `chore`.
Solo las dos primeras justifican interrumpir un proyecto que ya lo tiene instalado
(ver `PLAN.md` D12 — la auditoría reporta, nunca actualiza sola).

## v1 — 2026-09-27

- **feat** Primera versión. `lib/email/server.ts` extraído y fusionado de dos
  fuentes reales:
  - `zazpi`: singleton lazy de `Resend`, `import "server-only"` (falla si algo
    del cliente intenta importar este archivo).
  - `landing-golf`: el chequeo `{ data, error }` — **Resend no lanza en fallos
    de la API** (llave inválida, dominio no verificado, destinatario
    rechazado…), solo en fallos de red. Sin este chequeo, un envío rechazado
    pasa silenciosamente como éxito. Verificado contra la API real de Resend
    (no un mock): una llave inválida de prueba devolvió
    `{ ok: false, error: "API key is invalid" }` correctamente, en vez de
    reportar éxito.
  - `EMAIL_FROM` en `lib/env.ts` usa el validador de `zazpi` que acepta
    `"correo@dominio"` y `"Nombre <correo@dominio>"` — un `z.email()` a secas
    rechazaría la segunda forma, que es justo la que ve el destinatario.
- **feat** `emails/base-layout.tsx` extraído de `zazpi`, generalizado:
  - Lee `design-system/tokens.json` directo como JSON — nunca CSS. Los
    clientes de correo no soportan `var(--...)` de forma confiable, por eso la
    plantilla base no puede depender de `styles/tokens.css` como el resto del
    proyecto. Este es el uso real de `color.paper.*` (superficie clara
    dedicada) que `modules/tokens` ya anticipaba en su `SKILL.md`.
  - Quitado el nombre de marca hardcodeado (`brandName` ahora es prop) y
    renombrados los campos de acento de `tokens.json` (`goldInk`/`goldRule` de
    `zazpi` → `accentInk`/`accentRule`, ya generalizados en `modules/tokens`).
  - `import { render } from "react-email"` — **no** `@react-email/render`
    como paquete aparte, y **no** el parámetro `react:` de Resend (que
    depende de `@react-email/render` instalado por separado). `react-email`
    v6 ya reexporta `render` y todos los componentes de email; usar el
    parámetro `react:` de Resend rompería en runtime porque ese paquete no
    está instalado. Gotcha real encontrado en el código de `zazpi`, documentado
    ahí con esas palabras exactas.
- **feat** `emails/reset-password.tsx` — plantilla nueva, no copiada de
  ninguno de los dos proyectos: `zazpi` no tiene auth todavía y la de
  `landing-golf` es HTML crudo con marca de torneo de golf hardcodeada (verde
  oscuro, dorado, logo, fecha del evento). Escrita desde cero sobre
  `BaseEmailLayout` + tokens, siguiendo el mismo patrón que sí es reusable.
- **feat** Conectado el stub de `sendResetPasswordEmail` en
  `lib/auth/server.ts` — cierra el enlace que `modules/auth` dejó pendiente
  ("reemplazar cuando se instale `email`"). Verificado de extremo a extremo con
  `next dev` real (no solo build): `render()` produce HTML válido con la URL
  de reset intacta, y `sendEmail()` llega de verdad a la API de Resend.
- **chore** Si se instala `email` en un proyecto que **no** tiene `auth`, el
  paso de conectar `sendResetPasswordEmail` no aplica — no hay nada que
  editar. Si se instala en un proyecto que **sí** tiene `auth` ya instalado,
  hay que reemplazar el stub de `lib/auth/server.ts` a mano (mismo límite que
  `db`/`auth`: la copia de archivos del registro no puede editar un archivo
  existente). Documentado en `SKILL.md`.
- **chore** `react-email` va en `dependencies`, no en `devDependencies` —
  aunque su README lo describe como "preview de correos en el navegador", el
  código de producción importa `render()` de ahí en tiempo de ejecución
  (`lib/auth/server.ts`, cualquier route handler que arme un correo). Un
  `npm ci --omit=dev` lo rompería si quedara en dev. Confirmado contra el
  `package.json` real de `zazpi`, que también lo declara como dependencia
  de producción.
