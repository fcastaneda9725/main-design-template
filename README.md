# main-design-template

Kit privado para arrancar y mantener proyectos Next.js sin perder lo aprendido en
cada uno. Lo que un proyecto resuelve en producción se convierte en un módulo que
los demás pueden instalar.

Este repositorio es dos cosas a la vez, con una sola fuente de verdad:

- **Registro privado de shadcn:** los módulos se instalan con
  `npx shadcn add @main/<módulo>`. El código se copia al proyecto y el proyecto
  pasa a ser su dueño.
- **Marketplace de plugin de Claude Code:** cuatro skills que arrancan proyectos,
  instalan módulos, extraen módulos nuevos y auditan versiones.

También es una app Next.js que compila de verdad. Los módulos se desarrollan y se
prueban aquí, y `registry.json` solo apunta a archivos que ya funcionan.

> **No es** un starter para clonar y recortar, ni un monorepo de paquetes npm, ni
> un kit multiplataforma. Las razones y las decisiones `D01`–`D13` están en
> [`PLAN.md`](./PLAN.md).

## Por qué existe

El stack de los proyectos ya convergía, pero el conocimiento no viajaba entre
ellos. El caso que dio origen al kit: `solvo` resolvió que el link de reset de
contraseña quedaba atrapado en el iframe de los clientes de correo, y un mes
después `landing-golf` reintrodujo el mismo bug porque el arreglo vivía en un
archivo de otro proyecto.

## Módulos

| Módulo | Qué instala | Arrastra |
|---|---|---|
| `base` | Validación de entorno, `Result<T>`, código de referencia de errores, estados de vista y `AGENTS.md` | `button` de shadcn |
| `tokens` | `tokens.json`, generador de CSS, alias de shadcn y test de drift | — |
| `db` | Neon + Drizzle con `neon-http`, un archivo por tabla | `base` |
| `auth` | better-auth + `drizzleAdapter` + `admin()`. Solo cableado, sin pantallas | `db` |
| `email` | Resend + React Email, layout base y correo de reset | — |

El resto del catálogo (`payments`, `storage`, `analytics`, `i18n`, flujos…) está en
[`PLAN.md` §5](./PLAN.md). Esos módulos todavía no existen: llegan con
`/main-design-extract` cuando un proyecto real los pida, nunca por adelantado.

## Usar el kit en un proyecto

### Opción 1: con las skills de Claude Code

Instala el plugin. Necesitas acceso a este repositorio privado:

```text
/plugin marketplace add fcastaneda9725/main-design-template
/plugin install main-design@main-design
```

| Skill | Para qué sirve |
|---|---|
| `/main-design-start` | Crea un proyecto desde cero: scaffold, `base`, tema y módulos |
| `/main-design-add` | Instala un módulo y hace el cableado manual: env vars, barrels y migraciones |
| `/main-design-extract` | Convierte código que ya funciona en producción en un módulo del kit |
| `/main-design-audit` | Reporta módulos desactualizados. Nunca actualiza por su cuenta |

### Opción 2: con el CLI de shadcn

1. Si el proyecto es nuevo, créalo con Radix. Sin `--base radix`, el CLI instala
   Base UI:

   ```bash
   npx shadcn@latest init --template next -d --base radix -n <nombre>
   ```

2. Agrega el registro a `components.json`:

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

   `components.json` se commitea, así que el token siempre va interpolado. Define
   `REGISTRY_TOKEN` en tu entorno o en `.env.local`.

3. Instala los módulos de uno en uno:

   ```bash
   npx shadcn add @main/base
   npx shadcn add @main/auth   # también arrastra db
   ```

4. Completa el cableado. Cada módulo deja sus pasos manuales en
   `.claude/skills/<módulo>/SKILL.md`.

## Desarrollar el kit

Requisitos: Node.js y npm.

```bash
npm install
npm run dev
```

La app arranca sin variables de entorno. Las que usan los módulos se validan en
[`lib/env.ts`](./lib/env.ts):

| Variable | Dónde se usa |
|---|---|
| `NEXT_PUBLIC_APP_URL` | URLs absolutas (`base`) |
| `DATABASE_URL` | `db` |
| `BETTER_AUTH_SECRET` | `auth`, mínimo 32 caracteres: `openssl rand -base64 32` |
| `RESEND_API_KEY`, `EMAIL_FROM` | `email` |
| `REGISTRY_TOKEN` | `proxy.ts` y clientes del registro; no pasa por `lib/env.ts` |

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` / `build` / `start` | Ciclo normal de Next.js |
| `npm run typecheck` | Revisa los tipos con `tsc --noEmit` |
| `npm run lint` / `format` | ESLint y Prettier |
| `npm run test` | Vitest, incluido el test de drift de tokens |
| `npm run tokens` | Regenera `styles/tokens.css` desde `design-system/tokens.json` |
| `npm run registry:build` | Ensambla `registry.json` y genera `public/r/*.json` |
| `npm run db:generate` / `db:migrate` / `db:studio` | Migraciones y estudio de Drizzle |

### Dónde vive cada cosa

```text
app/, components/, lib/, db/, emails/   Código real de los módulos
design-system/tokens.json               Fuente de tokens
styles/tokens.css                       Generado, no editar a mano
modules/<módulo>/                       Metadata: registry-item.json, CHANGELOG.md, SKILL.md
registry.json                           Generado desde modules/
public/r/                               Salida del registro, no se versiona
plugins/main-design/                    Skills del plugin
proxy.ts                                Exige el token en /r/*; no se instala en proyectos
```

`modules/` no contiene código: cada `registry-item.json` apunta a los archivos
reales de la app para no mantener dos copias.

### Agregar o cambiar un módulo

1. Escribe el código en la app y comprueba que compila. Si viene de un proyecto,
   usa `/main-design-extract`.
2. Crea o actualiza `modules/<módulo>/` con `registry-item.json`, `SKILL.md` y
   `CHANGELOG.md`.
3. Abre cada archivo instalado con su marca de versión, por ejemplo
   `// kit: auth@1`.
4. Registra el cambio con severidad y por síntoma: `fix-seguridad`, `fix`, `feat`
   o `chore`. Por ejemplo, "el link de reset no funcionaba al hacer clic desde
   Gmail", no "arregla el manejo de la URL".
5. Verifica y regenera el registro:

   ```bash
   npm run typecheck && npm run test && npm run build
   npm run registry:build
   ```

Las convenciones de código están en [`AGENTS.md`](./AGENTS.md).

## Publicación

El registro se sirve desde `https://main-design-template.vercel.app`. `proxy.ts`
responde `401` sin el token correcto y `500` si `REGISTRY_TOKEN` no está
configurado, de modo que nunca queda abierto por defecto.

`npm run build` no genera `public/r/`, y esa carpeta no se versiona. Antes de
desplegar, corre `npm run registry:build`.

## Estado

- Los cinco módulos de la primera ronda, las cuatro skills y el registro están
  construidos y publicados.
- **Pendiente:** validar el flujo completo de `npx shadcn add @main/<módulo>` en un
  proyecto real con Next.js y Drizzle. `insignia` validó las decisiones, pero no la
  instalación, porque usa Prisma.
- Todavía no hay ningún `theme-<cliente>` en el registro.
