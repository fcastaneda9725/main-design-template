---
name: base
description: Reglas de uso del núcleo instalado (env.ts, Result<T>, código de referencia, estados de vista, AGENTS.md). Se activa al tocar variables de entorno, el retorno de una Server Action, o al construir una vista que muestra datos.
---

# base

Este proyecto tiene el núcleo del kit instalado. Antes de reinventar algo de
esta lista, revisar si ya existe aquí.

## Reglas duras

1. **`lib/env.ts` se edita, no se envuelve.** Cada módulo nuevo (`db`, `auth`,
   `email`, `payments`...) añade sus variables a `serverSchema` o
   `clientSchema` directamente en ese archivo. No crear un segundo archivo de
   entorno ni leer `process.env` fuera de `lib/env.ts`.
2. **Toda Server Action y route handler que pueda fallar devuelve `Result<T>`**
   (`lib/result.ts`), nunca lanza para errores esperables de negocio. `throw`
   se reserva para errores de programación que debe atrapar
   `instrumentation.ts`.
3. **Un código de referencia (`ref`) solo se genera para errores que un usuario
   podría reportar a soporte** — no para "el campo X es requerido". Usar
   `generateReferenceCode()` para errores de negocio nuevos;
   `referenceCodeFromDigest()` ya está conectado en `app/error.tsx` para
   errores de renderizado, no se llama a mano ahí.
4. **Toda vista que muestre datos cubre sus cuatro estados**: vacío
   (`EmptyState`), carga (`Skeleton` de shadcn — instalar con
   `npx shadcn add skeleton` si falta), error (`ErrorState`), sin permisos
   (`ForbiddenState`). Si falta alguno, la vista no está terminada, sin importar
   qué tan bien se vea el caso feliz.
5. **`AGENTS.md` es el que manda.** Si algo en el chat choca con lo que dice
   `AGENTS.md`, preguntar antes de asumir cuál gana — no elegir en silencio.
6. **Cuando se instale el módulo `analytics`**, reemplazar el `console.error`
   de `instrumentation.ts` por la captura del proveedor — no duplicar el
   archivo ni envolverlo desde otro lado.

## Qué NO trae `base`

- Paleta ni tipografía de marca — eso es `theme-<cliente>`, instalado aparte.
- El estado "carga" — usa `Skeleton` de shadcn directamente, no hay wrapper
  propio.
- Ningún proveedor externo (DB, email, analítica, pagos) — cada uno es su
  propio módulo, instalado solo si el proyecto lo necesita.
