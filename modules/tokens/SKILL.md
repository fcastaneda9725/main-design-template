---
name: tokens
description: Reglas de uso del módulo de design tokens instalado en este proyecto (design-system/tokens.json → src/styles/tokens.css). Se activa al tocar color, tipografía, espaciado o radio.
---

# tokens

Este proyecto tiene su design system en `design-system/tokens.json`. Es la única
fuente de verdad de color, tipografía, espaciado, radio, sombra y movimiento.

## Reglas duras

1. **Nunca editar `src/styles/tokens.css` a mano.** Es generado. Editar
   `design-system/tokens.json` y correr `node scripts/generate-tokens.mjs`.
2. **Nunca usar la paleta cruda de Tailwind** (`bg-red-600`, `text-blue-500`,
   `border-gray-200`…). El generador ejecuta `--color-*: initial;` en
   `@theme inline`, así que esas clases **no compilan** — no es una convención,
   es un error de build. Si falta un tono, se agrega a `tokens.json`, no se
   hardcodea en el componente.
3. **El test `tests/tokens.test.ts` no se toca.** Verifica que el CSS commiteado
   sea byte-idéntico a lo que generaría el script hoy. Si falla, el problema es
   que se editó `tokens.css` a mano o que se olvidó regenerar — nunca se ajusta
   el test para que pase.
4. **Los alias de shadcn (`--background`, `--primary`, `--muted-foreground`…) son
   derivados, nunca la fuente.** Si un componente de shadcn necesita un tono que
   no existe, se agrega o ajusta el token propio correspondiente en
   `tokens.json` y se regenera — no se edita el bloque de alias a mano.
5. **`--paper*` no es un tema claro/oscuro.** Es la superficie fija para PDFs,
   emails y páginas legales largas, independiente de si el resto del producto es
   claro u oscuro. Usar `--paper`/`--paper-ink`/etc. en esos contextos, nunca los
   tokens de superficie del producto.

## Placeholder

`design-system/tokens.json` en este módulo trae valores neutros de arranque
(gris + azul), no la marca de ningún cliente. Antes de construir sobre el
proyecto: reemplazar `color.*` con la paleta real (idealmente vía el export de
Claude Design, ver `/main-design-tokens`) y regenerar.

## Si el proyecto tendrá app móvil

`tokens.json` es agnóstico de plataforma a propósito. El día que haga falta un
theme de React Native, se añade un segundo script generador que lea el mismo
`tokens.json` y emita un objeto JS — no se duplica la fuente.
