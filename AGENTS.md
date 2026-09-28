# AGENTS.md

> Generado por el módulo `base` del kit (`main-design-template`). Las secciones
> marcadas `<!-- TODO(proyecto) -->` son las que varían por cliente — llenarlas
> al arrancar el proyecto. El resto no se edita salvo que la decisión de stack
> cambie de verdad para este proyecto en particular; si eso pasa, decirlo aquí
> explícitamente en vez de dejar que el código y el documento se desalineen.

## Stack

| Capa | Elección |
|---|---|
| Framework | Next.js App Router, TypeScript `strict` — Server Components por defecto, Server Actions para mutaciones |
| Estilos | Tailwind v4 + shadcn/ui — tokens como CSS variables, nunca hex ni paleta cruda de Tailwind sueltos |
| DB | Neon (Postgres) + Drizzle ORM, si el módulo `db` está instalado |
| Auth | better-auth + `drizzleAdapter`, si el módulo `auth` está instalado — solo cableado, la UI de login/registro es del proyecto |
| Validación | Zod en toda frontera (forms, server actions, webhooks) |
| Email | Resend + React Email, si el módulo `email` está instalado |
| Hosting | Vercel |
| Gestor de paquetes | el que ya tenga el proyecto (lockfile existente) — el kit es agnóstico |

Instalados en este proyecto: `base`, `tokens`, `db`.

<!-- TODO(proyecto): módulos adicionales — auth, email, payments, storage, analytics, i18n, flow-*. Listar aquí conforme se agregan con /main-design-add. -->

## Convenciones

- TypeScript estricto, sin `any`.
- Zod en toda frontera: formularios, Server Actions, webhooks, parsers externos.
- Server Actions devuelven `Result<T>` (`lib/result.ts`): `{ ok: true, data }` o
  `{ ok: false, error, ref? }`. `ref` solo para errores que un usuario podría
  reportar a soporte.
- Dinero: enteros en unidad menor (centavos) + `currency` explícito. Nunca `float`.
  Formatear con `Intl.NumberFormat` según locale.
- Fechas: `timestamptz` en DB, mostrar en la zona horaria del usuario o la del
  negocio si aplica — nunca asumir UTC en pantalla.
- Toda vista que muestre datos cubre sus cuatro estados: vacío (`EmptyState`),
  carga (`Skeleton` de shadcn), error (`ErrorState`, con código de referencia),
  sin permisos (`ForbiddenState`). Ver `components/states/`.
- Autorización siempre en servidor (Server Action / route handler con filtro
  explícito por rol y, si aplica, por tenant). Nunca ocultar un botón como única
  barrera.
- Nada de paleta cruda de Tailwind (`bg-red-600`, `text-blue-500`…). El módulo
  `tokens` resetea `--color-*` en `@theme inline`, así que esas clases no
  existen — Tailwind no genera ninguna regla para ellas (verificado: el build
  compila sin error, pero el elemento queda sin ese color, visualmente roto).
  No es una convención que se pueda ignorar en silencio, se nota en pantalla.
- Todo texto visible sale de un solo lugar (i18n si el proyecto lo tiene,
  constantes si no) — nunca hardcodeado disperso en componentes.
- Commits convencionales (`feat:`, `fix:`, `chore:`).

### Módulos del kit y su frontera cliente/servidor

Cada módulo instalado desde el registro separa:

```
lib/<módulo>/
  contract.ts   ← tipos + Zod + constantes. Sin imports de next/*, react ni Tailwind.
  server.ts     ← proveedor, DB, server-only
  client.ts     ← hooks, React
```

`contract.ts` es la frontera portable: si el proyecto alguna vez necesita una
app (Expo), esa capa se copia tal cual. No se filtra lógica de servidor ahí.

### Actualizaciones del kit

Cada archivo instalado por el registro abre con una marca:

```ts
// kit: <módulo>@<versión>
```

`/main-design-audit` compara esa marca contra el registro y reporta si hay una
versión más nueva y por qué importa (nunca actualiza solo). Si un archivo se
modificó a propósito y diverge del kit, se declara en la misma línea:
`// kit: payments@3 · divergido: <razón>` — así la auditoría deja de marcarlo.

## Estructura del proyecto

```
app/
  error.tsx              # boundary de error (base)
  api/                   # route handlers, webhooks
components/
  ui/                    # primitivas de shadcn
  states/                # EmptyState, ErrorState, ForbiddenState (base)
  domain/                # componentes propios del dominio de este proyecto
lib/
  utils.ts               # cn() — de `shadcn init`, no del kit
  result.ts              # Result<T> (base)
  env.ts                 # validación de entorno con Zod (base)
  errors/                # reference-code.ts (base)
  <módulo>/               # uno por módulo instalado: contract.ts / server.ts / client.ts
db/
  schema/                # una tabla por archivo
  migrations/
design-system/
  tokens.json             # fuente de tokens (módulo tokens)
instrumentation.ts        # captura de errores de servidor (base)
```

<!-- TODO(proyecto): estructura adicional específica de este proyecto (rutas por
rol, carpetas de dominio) si se desvía de lo anterior. -->

---

<!-- TODO(proyecto): Dominio —
qué hace el proyecto, para quién, en una o dos frases. -->

<!-- TODO(proyecto): Roles y permisos —
tabla de roles, quién es cada uno, qué puede hacer cada uno. -->

<!-- TODO(proyecto): Modelo de datos —
tablas núcleo y su propósito, más reglas duras del dominio (qué es append-only,
qué requiere motivo obligatorio, qué necesita aprobación). -->

<!-- TODO(proyecto): Fuera de alcance —
qué se decidió explícitamente no construir todavía, para que nadie lo asuma. -->

<!-- TODO(proyecto): Pendientes del cliente —
qué falta confirmar (textos legales, dominios, cuentas de cobro...) y qué valor
placeholder se usa mientras tanto. Marcar en el código con `// TODO(cliente):`. -->

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
