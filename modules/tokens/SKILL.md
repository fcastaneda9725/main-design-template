---
name: tokens
description: Reglas de uso del módulo de design tokens instalado en este proyecto (design-system/tokens.json → src/styles/tokens.css). Se activa al tocar color, tipografía, espaciado o radio.
---

# tokens

Este proyecto tiene su design system en `design-system/tokens.json`. Es la única
fuente de verdad de color, tipografía, espaciado, radio, sombra y movimiento.

## Reglas duras

1. **Nunca editar `styles/tokens.css` a mano** (o `src/styles/tokens.css` si el
   proyecto usa `src/` — ver el comentario de ruta en `scripts/generate-tokens.mjs`).
   Es generado. Editar `design-system/tokens.json` y correr
   `node scripts/generate-tokens.mjs`.
2. **Nunca usar la paleta cruda de Tailwind** (`bg-red-600`, `text-blue-500`,
   `border-gray-200`…). El generador ejecuta `--color-*: initial;` en
   `@theme inline`, así que esas clases **no existen** — Tailwind no genera
   ninguna regla CSS para ellas. No es un error de build (compila sin avisar),
   es que el elemento queda sin ese color: se nota de inmediato en pantalla,
   no en el CI. Si falta un tono, se agrega a `tokens.json`, nunca se
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
6. **Sin alternancia claro/oscuro en runtime** (D03: un solo tema por marca).
   Si el proyecto se scaffoldeó con `shadcn init`, este módulo espera que se
   haya quitado `next-themes`/`ThemeProvider` — nada en el proyecto debe
   aplicar la clase `.dark`. El `@custom-variant dark (&:is(.dark *))` de
   `app/globals.css` se mantiene a propósito: como esa clase nunca se aplica,
   neutraliza cualquier `dark:` que traiga un componente de shadcn en vez de
   dejarlo reaccionar a `prefers-color-scheme` del sistema operativo.
7. **`--chart-*` y `--sidebar*` no están aliasados todavía.** Si se instala un
   componente de shadcn que los usa (un `chart`, un `sidebar` de navegación),
   extender el bloque de alias en `scripts/lib/build-tokens-css.mjs` — no
   inventar valores de paleta categórica sin que el proyecto los pida.
8. **La escala de radio es fija (`none/xs/sm/md/lg/full`), no multiplicativa.**
   El CLI de shadcn deriva `--radius-xl` a `--radius-4xl` multiplicando un solo
   `--radius`; este módulo no. Si un componente instalado después usa
   `rounded-xl` o superior y se ve sin esquina, es esto — agregar el paso que
   falte a `tokens.json` → `radius`.

## Placeholder

`design-system/tokens.json` en este módulo trae valores neutros de arranque
(gris + azul), no la marca de ningún cliente. Antes de construir sobre el
proyecto: reemplazar `color.*` con la paleta real (idealmente vía el export de
Claude Design, ver `/main-design-tokens`) y regenerar.

## Si el proyecto tendrá app móvil

`tokens.json` es agnóstico de plataforma a propósito. El día que haga falta un
theme de React Native, se añade un segundo script generador que lea el mismo
`tokens.json` y emita un objeto JS — no se duplica la fuente.
