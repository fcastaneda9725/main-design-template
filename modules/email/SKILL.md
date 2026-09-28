---
name: email
description: Reglas de uso de Resend + React Email instalado en este proyecto (lib/email/server.ts, emails/). Se activa al enviar cualquier correo transaccional o escribir una plantilla nueva.
---

# email

Resend + React Email. Todo correo se envía a través de `sendEmail()`
(`lib/email/server.ts`) — nunca `resend.emails.send()` directo desde otro
archivo.

## Reglas duras

1. **Nunca llamar `resend.emails.send()` fuera de `lib/email/server.ts`.**
   Resend no lanza en fallos de la API (llave inválida, dominio no
   verificado, destinatario rechazado…) — regresa `{ data: null, error }`.
   `sendEmail()` ya hace ese chequeo y devuelve `Result<void>`; llamar a
   Resend directo en otro lado es reintroducir el bug de "envío rechazado que
   parece éxito".
2. **Siempre revisar el `Result` de `sendEmail()`.** Un correo que falla no
   debe hacer fallar la operación de negocio que lo disparó si esta ya se
   completó (ej. un lead que ya se guardó en la base de datos) — pero sí debe
   quedar registrado, nunca ignorado en silencio.
3. **Renderizar con `render()` de `"react-email"`, no con el parámetro
   `react:` de Resend.** Ese atajo de Resend depende de `@react-email/render`
   instalado como paquete aparte — este proyecto solo tiene el paquete
   unificado `react-email`, que ya incluye `render`. Usar `react:` rompe en
   runtime.
4. **`emails/base-layout.tsx` lee `design-system/tokens.json` como JSON
   directo, nunca `styles/tokens.css`.** Los clientes de correo no soportan
   `var(--...)` de forma confiable — por eso los emails son la única parte
   del proyecto que no consume tokens vía CSS. Si se necesita un tono que no
   está en `tokens.json` → `color.paper`, se agrega ahí, no se hardcodea un
   hex en el archivo del email.
5. **Nueva plantilla = nuevo archivo en `emails/`, envuelto en
   `BaseEmailLayout`.** No armar el `<Html>` desde cero cada vez.
6. **`brandName` no tiene un valor por defecto real.** Cada plantilla lo
   recibe como prop — llenarlo con el nombre real del proyecto, no dejarlo en
   el placeholder.

## Si el proyecto también tiene `auth`

`lib/auth/server.ts` trae un stub de `sendResetPasswordEmail` con un
comentario `// kit: email@1`. Reemplazar su cuerpo por:

```ts
const html = await render(ResetPasswordEmail({ resetUrl: args.resetUrl, brandName: "..." }));
const result = await sendEmail({ to: args.email, subject: "Recupera tu contraseña", html });
if (!result.ok) console.error("[auth] no se pudo enviar el correo de reset:", result.error);
```

Si `email` se instaló primero y `auth` se instala después, ese cableado ya
viene hecho — no hay nada que tocar.

## Qué NO trae `email`

- Plantillas de negocio específicas del proyecto (confirmación de compra,
  notificación de pago…) — solo `reset-password.tsx`, porque es lo único que
  otro módulo del kit (`auth`) ya necesita.
- Ningún proveedor alternativo a Resend (D06: sin variación observada en el
  portafolio, no se abstrae).
