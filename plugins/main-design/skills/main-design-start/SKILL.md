---
name: main-design-start
description: Arranca un proyecto nuevo desde cero con el kit main-design — scaffold de shadcn, módulo base, tema de marca y los módulos que el proyecto necesite. Se activa cuando el usuario quiere empezar un proyecto nuevo con este stack (Next.js + Tailwind v4 + shadcn + Drizzle/Neon + better-auth + Resend).
---

# main-design-start

Orquesta el arranque completo de un proyecto nuevo. No reinventa nada que
`main-design-add` ya resuelva — por cada módulo, delega en esa skill.

Fuente de verdad de todas las decisiones citadas aquí: `PLAN.md` del repo
`main-design-template` (`D01`–`D13`). Si algo de esta skill choca con
`PLAN.md`, `PLAN.md` gana — avisar al usuario y no improvisar.

## Precondición

Preguntar, si no está claro por contexto:
- Nombre del proyecto.
- Cliente/marca (para elegir o crear `theme-<cliente>`).
- Qué módulos además de `base` necesita de entrada (lo normal: `tokens`,
  `db`, `auth`, `email` — pero no asumir, preguntar).

## 1. Scaffold

```bash
npx shadcn@latest init --template next -d --base radix -n <nombre>
```

Reglas duras, verificadas con builds reales en este kit (`PLAN.md` §8 tarea 2):

- **`--base radix` es obligatorio.** Sin especificarlo, el CLI instala
  `@base-ui/react` (Base UI) en vez de Radix — de los proyectos auditados,
  ninguno usa Base UI. No omitir esta bandera nunca.
- El comando crea una subcarpeta con el nombre del proyecto aunque ya
  estés parado en el directorio correcto. Si eso pasa, mover el contenido a
  la raíz en vez de anidar.
- No "arreglar" el bug del `--font-sans` circular por adelantado — no aplica
  a un scaffold nuevo (solo ocurre al correr `init` sobre un `layout.tsx`
  preexistente con otro nombre de variable). Si aparece, es indicio de que se
  corrió `init` sobre algo que no estaba vacío.

## 2. Limpieza post-scaffold

- **No reintroducir `clsx` + `tailwind-merge` en `lib/utils.ts`.** El CLI
  actual escribe `export { cn } from "cn"` (paquete npm) — dejarlo así.
- **Quitar `next-themes` y el `ThemeProvider`** que trae el scaffold (toggle
  claro/oscuro). El módulo `tokens` asume un solo tema por marca (`D03`) — el
  toggle no tiene tokens que alternar y queda muerto.

## 3. Registro del kit

Verificar que `components.json` tenga la entrada del registro privado
(`D13`):

```json
{
  "registries": {
    "main": {
      "url": "https://main-design-template.vercel.app/r/{name}.json",
      "headers": { "Authorization": "Bearer ${REGISTRY_TOKEN}" }
    }
  }
}
```

El token va **interpolado**, nunca literal — `components.json` se commitea.
`REGISTRY_TOKEN` no se genera aquí: es el mismo secreto que protege el
registro en Vercel (`proxy.ts` del kit lo valida), pedirlo al usuario — no
inventarlo.

## 4. Instalar `base`

Invocar la skill `main-design-add` con `base`. Es el único módulo que no es
opcional — todo lo demás depende de él (`lib/env.ts`, `Result<T>`, los tres
estados de vista).

## 5. Tema de marca

Preguntar si ya existe `theme-<cliente>` en el catálogo o si hay que crear
uno nuevo a partir de un export `.dc.html` de Claude Design. `base` no
hornea paleta (`D03`) — sin este paso el proyecto queda con los valores
placeholder de `tokens`.

## 6. Módulos adicionales

Por cada módulo que el usuario pidió (`tokens`, `db`, `auth`, `email`, u
otro del catálogo en `PLAN.md` §5), invocar `main-design-add` con ese
nombre, uno a la vez — no en paralelo, porque `registryDependencies` puede
hacer que un módulo dependa de otro que se está instalando en el mismo lote
(p. ej. `auth` arrastra `db`).

## 7. `AGENTS.md`

`base` ya instaló un `AGENTS.md` con las secciones invariantes del kit más
encabezados `<!-- TODO(proyecto) -->` (`D04`). Completar esos encabezados
entrevistando al usuario sobre lo específico del cliente: dominio, roles,
modelo de datos. No inventar contenido de negocio que el usuario no dio.

## 8. Verificación final

No declarar el arranque terminado solo por haber copiado archivos. Correr:

```bash
npm run build
npx tsc --noEmit
npm run test   # si algún módulo instalado trae tests (tokens sí)
```

Si algo falla, no es un problema del proyecto nuevo — es que un módulo del
kit tiene un supuesto que no se sostiene en este scaffold. Reportarlo así,
no parchear a ciegas en el proyecto nuevo.

## Qué NO hace esta skill

- No escribe pantallas de login/registro ni ninguna UI de marca — eso es del
  proyecto, sobre los tokens semánticos del tema instalado.
- No decide abstracciones nuevas (`payments`, `storage`) por adelantado —
  esos módulos llegan por `main-design-extract` cuando un proyecto real los
  necesite, nunca antes (`PLAN.md`, regla de proceso en la memoria del kit).
