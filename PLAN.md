# main-design-template — Plan de diseño

> Documento fundacional. Redactado el 2026-09-27 a partir de una auditoría de los
> 18 proyectos en `~/Desktop`. Cada decisión lleva ID (`D01`…`D12`) para poder
> citarse desde el código y desde los `SKILL.md` de los módulos.
>
> Si algo aquí choca con una instrucción puntual del chat, pregunta antes de asumir.

---

## 1. Qué es esto

Un repositorio que hace dos cosas a la vez:

1. **Registro de shadcn privado** — módulos que se instalan dentro de un proyecto
   con `npx shadcn add @main/<módulo>`. El código queda dentro del proyecto y el
   proyecto es su dueño.
2. **Marketplace de plugin de Claude Code** — las skills que operan el kit
   (`/main-design-start`, `/main-design-add`, `/main-design-extract`,
   `/main-design-audit`).

Una sola fuente de verdad, dos canales de distribución.

### Qué NO es

- No es un monorepo de paquetes npm versionados (ver `D01`).
- No es un starter que se clona y se recorta.
- No es cross-platform. Web primero (ver `D07`).

---

## 2. El problema que resuelve

La auditoría encontró que el stack ya converge de forma natural, pero **el
conocimiento no viaja entre proyectos**. El caso que lo demuestra:

| Proyecto | Fecha | URL de reset de contraseña |
|---|---|---|
| `solvo` | agosto 2026 | `${appUrl}/nueva-contrasena?token=${token}` — link directo, **con el arreglo** |
| `landing-golf` | septiembre 2026 (posterior) | `resetUrl: url` — URL cruda de better-auth, **sin el arreglo** |

El redirect intermedio de better-auth queda atrapado en el iframe sandboxed de los
clientes de correo. Se descubrió en `solvo`, se documentó en un comentario, y un mes
después se reintrodujo el bug en `landing-golf` porque el conocimiento vivía en un
archivo de otro proyecto.

Eliminar esa clase de pérdida es el propósito del kit.

---

## 3. Stack (evidencia, no preferencia)

Frecuencia medida sobre 30 `package.json` de 14 proyectos:

| Capa | Elección | Evidencia |
|---|---|---|
| Framework | Next.js App Router + TS `strict` | 11/13 |
| Estilos | Tailwind v4 (`@tailwindcss/postcss`) | 13/13 |
| UI | shadcn + `cva` + `clsx` + `tailwind-merge` + `lucide` | 5-6 |
| DB | Neon + Drizzle | 6/6 en lo reciente. Prisma solo en los 3 heredados |
| Auth | **better-auth** con `drizzleAdapter` | `D05` |
| Validación | Zod **v4** (`z.treeifyError`, `z.email()`) | 8 — confirmado v4 en `zazpi` |
| Email | Resend (+ React Email) | 5 |
| Analítica y errores | PostHog, único proveedor | 3 |
| Pagos | Stripe + MercadoPago + transferencia manual | 3 |
| i18n | `next-intl` | 2 |
| Tests | Vitest (+ Playwright) | 4 |
| Hosting | Vercel | — |
| Gestor de paquetes | **agnóstico** — shadcn detecta el lockfile | npm 6 / pnpm 3 |

> ⚠️ `zazpi/CLAUDE.md` declara `pnpm` y Auth.js. Ambas líneas están desactualizadas
> respecto a donde realmente aterrizaste. Corregir ese archivo es tarea pendiente.

---

## 4. Decisiones

### D01 — Los módulos se copian, no se instalan como paquetes
El registro copia archivos fuente dentro del proyecto. **No** hay paquetes npm
versionados.

**Por qué:** con clientes distintos, cada proyecto termina necesitando una variante
(`landing-golf` usa Stripe con cupones; `solvo` usa Stripe *y* MercadoPago detrás de
una interfaz). Un paquete versionado obliga a hacer la abstracción genérica por
adelantado y a mantener 18 consumidores. Código copiado puede divergir sin culpa,
que es lo que de hecho ocurre.

**Consecuencia:** hace falta una ruta de actualización explícita (`D10`).

### D02 — La plomería es el registro de shadcn, publicado en Vercel
`registry.json` → `npx shadcn build` → `public/r/*.json` → Vercel.

**Por qué:**
- `components.json` del proyecto define sus aliases, así que el CLI coloca cada
  archivo en la ruta correcta *de ese proyecto* (con `src/` o sin `src/`).
- `dependencies` instala paquetes npm; `registryDependencies` arrastra otros módulos
  del kit y componentes de shadcn oficial en la misma operación.
- Funciona sin una sesión de Claude abierta.

**Verificado** en `shadcn@4.x`: los tipos de ítem incluyen `registry:lib`,
`registry:file` (con `target`), `registry:page`, `registry:hook`, `registry:block`.
El registro **no** está limitado a componentes de UI: puede colocar
`lib/payments/stripe.ts`, `src/db/schema/users.ts`, `app/api/webhooks/stripe/route.ts`.

**Corolario:** este repo es una app Next.js que compila de verdad. Los módulos se
desarrollan y prueban dentro de ella; `registry.json` solo apunta a archivos que ya
funcionan. Es lo que evita que el kit envejezca como un starter muerto.

### D03 — Tres capas: `base` / `theme-<cliente>` / módulos
Lo invariante entre proyectos no es visual, son **decisiones**.

| Capa | Contiene | Por proyecto |
|---|---|---|
| `base` | `env.ts` (Zod v4), `cn()`, tipo `Result<T>`, código de referencia determinista + captura de errores de servidor, los tres estados de vista (vacío/error/sin permisos), `AGENTS.md` | idéntico siempre |
| `theme-<cliente>` | paleta, tipografía, radios de *esa* marca | uno por marca |
| módulos | `db`, `auth`, `email`, `payments`… | à la carte |

`base` **no** hornea paleta. La paleta es datos; el núcleo es estructura.

### D04 — `AGENTS.md` lo genera `base`, híbrido
`base` instala un `AGENTS.md` con las secciones invariantes (stack, convenciones,
estructura) más encabezados marcados `<!-- TODO(proyecto) -->` para lo específico del
cliente (dominio, roles, modelo de datos).

**Por qué:** hoy ese archivo se escribe a mano, 267 líneas en `zazpi` y 679 en
`interceptaDopamina`. Con `base` bajan a ~80 escritas a mano.

### D05 — `auth` se estandariza en better-auth con `drizzleAdapter`
**Por qué:** es donde convergiste solo. Los dos proyectos más maduros lo eligieron de
forma independiente y `landing-golf` **migró hacia él abandonando Supabase**
(`supabase` está en 0 en su `package.json`). Encaja con Drizzle+Neon sin pegamento, y
`plugins: [admin({ defaultRole })]` cubre el patrón de roles y aprobación que es
central en tus proyectos.

Clerk (`tdm-coach`) y next-auth (`insignia`, `media-vip`) quedan como heredados. No se
soportan en el kit.

### D06 — Abstrae solo donde hay variación observada
| Módulo | ¿Interfaz? | Razón |
|---|---|---|
| `email` | **No.** Resend directo | 5/5 usan Resend |
| `db` | **No.** Drizzle+Neon directo | 6/6 en lo reciente |
| `analytics` | **No.** PostHog directo | 3/3, y ya está escrito "único proveedor" |
| `payments` | **Sí.** `PaymentProvider` | Stripe + MercadoPago + transferencia manual conviven, y hay razón de negocio: Stripe puede congelar la cuenta |
| `storage` | **Sí, delgada** (`put`, `signedUrl`, `delete`) | R2 y Vercel Blob según proyecto |

El costo de una interfaz no es escribirla: es que cada capacidad específica del
proveedor te obliga a ensancharla o romperla. Con 5/5 usando Resend, ese impuesto no
compra nada.

### D07 — Web primero. La frontera portable es el contrato
El kit **no** cubre móvil como destino par.

**Por qué:** dos de tres monorepos armaron el andamio de código compartido y nunca lo
usaron — `que-veo/packages/shared` contiene *solo* un `package.json` v0.0.0. El único
que sí comparte (`MiMecanico`) comparte exactamente tres cosas: **tipos, validaciones
Zod y constantes**. Nunca UI, nunca infraestructura.

**Regla que sí aplica** — en cada módulo:

```
lib/<módulo>/
  contract.ts    ← tipos + Zod + constantes. Sin imports de next/*, react ni Tailwind
  server.ts      ← proveedor, DB, server-only
  client.ts      ← hooks, React
```

Costo casi cero; beneficio: el día que un cliente pida app, `contract.ts` se copia tal
cual. Efecto secundario valioso incluso sin móvil: `contract.ts` no puede importar la
DB, así que un schema Zod no puede filtrarse con lógica de servidor.

Si móvil se vuelve serio: **registro separado** `kit-expo` (Expo Router + Zustand +
TanStack Query, ya fijo en 3/3). No se contaminan los ítems web.

### D08 — Dos tipos de skill, según cuándo se necesitan

**Tipo 1 — operar el kit** (global, vía plugin):

| Skill | Qué hace |
|---|---|
| `/main-design-start` | proyecto vacío → `init --template next -d` → `base` → `theme` → módulos → `AGENTS.md` |
| `/main-design-add` | instala un módulo y hace el cableado que el CLI no puede: registrar provider, agregar env vars, correr migración |
| `/main-design-extract` | lo inverso: convierte un `lib/` que ya funciona en producción en módulo del kit |
| `/main-design-audit` | reporta módulos desactualizados (ver `D10`) |

**Tipo 2 — reglas de uso del módulo** (por proyecto, vía el registro):
al instalar `payments`, el registro deja `.claude/skills/payments/SKILL.md` con sus
reglas (dinero en enteros, verificar firma del webhook, idempotencia por `event.id`).

**Por qué skills y no texto en `AGENTS.md`:** `AGENTS.md` se carga completo en cada
sesión. Las skills se cargan solo cuando son relevantes. Con 8 módulos instalados,
meter sus reglas en `AGENTS.md` cuesta tokens incluso cuando se está tocando CSS.

> `/main-design-extract` es la más importante de las cuatro. Un template que se llena
> por adelantado adivinando se muere; uno que se alimenta de lo que ya funcionó en
> producción crece solo. Y resuelve el arranque: no hay que construir 15 módulos antes
> de que el kit sirva.

### D09 — Los tokens propios son la fuente; los de shadcn son alias generados
Tu vocabulario (`zazpi`) es un **superconjunto** del de shadcn:

| | Vocabulario |
|---|---|
| shadcn | `--background`, `--foreground`, `--primary`, `--muted`, `--card`, `--ring`, `--destructive` |
| propio | `--bg-{canvas,surface,raised,inset}`, `--text-{primary,body,muted,subtle,disabled}`, `--border-{subtle,default,strong}`, `--accent`, `--focus-ring` |

El generador emite los tuyos y, después, los alias:

```css
--background: var(--bg-canvas);
--card: var(--bg-surface);
--popover: var(--bg-raised);
--foreground: var(--text-primary);
--muted-foreground: var(--text-muted);
--border: var(--border-default);
--ring: var(--focus-ring);
--destructive: var(--error);
```

**Por qué:** de 4 niveles de superficie puedes derivar los 2 de shadcn; de 2 no puedes
inventar 4. La fuente siempre es el superconjunto. Son ~15 líneas generadas, cubiertas
por el test de drift.

**Beneficio estratégico:** `tokens.json` es agnóstico de plataforma, así que un mismo
generador puede emitir tres salidas — CSS vars (web), objeto JS (React Native), y
paleta clara para PDFs y emails (que `zazpi` necesita aunque la marca sea oscura). Con
los tokens de shadcn como fuente eso es imposible: `--background` en un email no
significa nada.

### D10 — `tokens` es módulo aparte, con ingesta desde Claude Design
Pipeline actual de `zazpi`, que se extrae al kit:

```
Claude Design (.dc.html) → design-system/tokens.json → scripts/ → src/styles/tokens.css
                                                            ↑
                                       test que falla si el CSS commiteado no es
                                       byte-idéntico al generado (zazpi D15)
```

Ese test de drift impide editar a mano un CSS generado. Se conserva.

**Aparte de `base`** porque `base` debe poder instalarse en un proyecto que use el
design system propio de un cliente.

El generador emite `--color-*: initial; --radius-*: initial;` al abrir `@theme
inline` (verificado en `zazpi/src/styles/tokens.css:169-170`, y confirmado con un
build real: `bg-red-600` forzado en una página compila sin error pero Tailwind no
genera ninguna regla para esa clase — el elemento queda visiblemente sin color, no
hay error de CI). Borra la paleta y la escala de radios por defecto de Tailwind
antes de declarar las propias. Es lo que hace que la regla de "cero paleta cruda"
de `D11` se note de inmediato en pantalla en vez de perderse como convención de
prosa — no es, con precisión, un error de build.

`/main-design-tokens` (parte de la skill de arranque) lee el export `.dc.html` y
produce el `tokens.json`. Hoy ese paso es manual y es donde se pierde fidelidad entre
lo diseñado y lo implementado.

### D11 — Los `flow-*` traen lógica, no presentación
Un `flow-*` es un vertical: schema + rutas + lógica de un flujo que ya se escribió más
de una vez completo.

| Sí trae | No trae |
|---|---|
| tablas Drizzle + migración | layout de página, hero, logo, copy de marketing |
| server actions / route handlers con permisos | decisiones visuales |
| validadores Zod compartidos cliente/servidor | |
| máquina de estados (transiciones válidas, quién las mueve) | |
| lógica de formulario headless (hooks, no markup) | |
| emails transaccionales del flujo | |

**Pantalla de referencia:** sí entra, con dos condiciones duras —

1. **Cero paleta cruda.** Solo tokens semánticos (`text-destructive`, no `text-red-600`).
2. Primera línea de cada archivo de pantalla: `// REFERENCIA: reemplazar por la UI de marca`.

> Contexto: la UI de auth de `landing-golf` tiene **0 tokens semánticos y 8 clases de
> paleta cruda**, mientras `zazpi/CLAUDE.md` exige "nunca se hardcodea en el
> componente". La regla existe y nada la hace cumplir. `zazpi` sí la hace cumplir,
> pero no con lint: con `--color-*: initial;` en `@theme inline` (ver `D09`/`D10`),
> que borra la paleta por defecto de Tailwind entera. `bg-red-600` deja de existir
> como clase (confirmado con un build real: compila, pero Tailwind no genera la
> regla y el elemento queda sin color) — se nota en pantalla, no solo se recomienda
> en prosa. Ese mecanismo se adopta en `tokens`, no un ESLint aparte.

`auth` **no** trae pantallas (decisión explícita): el login depende de la marca.

### D12 — La actualización reporta, nunca actualiza sola
Cada archivo instalado arranca con una marca:

```ts
// kit: payments@3 · a4f1c2e · 2026-09-27
```

`/main-design-audit` recorre el proyecto, compara contra el registro y reporta:

```
payments@3  → hay payments@5
   v4  fix  el webhook cobraba doble cuando Stripe reenviaba el mismo event.id
   v5  feat soporte de MercadoPago

auth@2      → hay auth@4
   v3  fix  el link de reset no funcionaba al hacer click desde Gmail   ← TE FALTA
   v4  chore renombres internos
```

Tres condiciones que hacen que funcione:

1. **Reporta, nunca actualiza solo.** Toda la razón de `D01` fue que los proyectos
   *puedan* divergir. Un auto-update pelearía contra la decisión fundacional.
2. **La deriva intencional se declara:**
   `// kit: payments@3 · divergido: el cliente usa SPEI, no tarjeta`.
   La auditoría lo respeta y deja de molestar. Sin esto, la herramienta se vuelve
   ruido y se ignora a los dos meses.
3. **CHANGELOG con severidad y redactado por síntoma.**
   `fix-seguridad` / `fix` / `feat` / `chore`. Solo los dos primeros interrumpen.
   *"Arregla el manejo de URL de reset"* es inútil.
   *"El link de reset no funcionaba al hacer click desde Gmail"* hace reaccionar.

> Lo que se propaga es **conocimiento**, no código. Un `npm update` te habría dado el
> archivo nuevo sin decirte nunca por qué importaba.

### D13 — Registro privado, un solo registro
`components.json` del proyecto:

```json
{
  "registries": {
    "main": {
      "url": "https://<host>/r/{name}.json",
      "headers": { "Authorization": "Bearer ${REGISTRY_TOKEN}" }
    }
  }
}
```

Instalación: `npx shadcn add @main/payments`.

**Por qué privado:** los `flow-*` codifican reglas de negocio de clientes (foto
obligatoria, motivo obligatorio del supervisor, quién puede reabrir una operación) y
los `theme-<cliente>` contienen su paleta de marca.

**Por qué uno solo y no público-para-técnicos / privado-para-clientes:** el split
obliga a clasificar correctamente cada módulo nuevo para siempre, y una sola
clasificación mal hecha publica la lógica de un cliente en una URL adivinable. El
beneficio del split es cero.

El token va **interpolado como variable de entorno**, nunca literal — `components.json`
se commitea.

---

## 5. Catálogo

| Módulo | Proyectos que ya lo tienen | Primera ronda | Notas |
|---|---|---|---|
| `base` | — | ✅ **construido** | `env.ts` (Zod v4), `Result<T>`, código de referencia, `instrumentation.ts`, estados, `AGENTS.md` |
| `tokens` | `zazpi` (maduro) | ✅ **construido** | generador + alias shadcn + test de drift |
| `db` | 6 | ✅ | Neon + Drizzle + `drizzle.config.ts` |
| `auth` | 5 | ✅ | better-auth + `drizzleAdapter`. Solo cableado |
| `email` | 5 | ✅ | Resend + React Email, plantilla base bilingüe |
| `payments` | 3 | — | interfaz `PaymentProvider` + stripe + mercadopago + transferencia manual |
| `storage` | 3 | — | interfaz delgada, R2 + Vercel Blob, URLs firmadas |
| `analytics` | 3 | — | PostHog + banner de consentimiento + `maskAllInputs` |
| `rate-limit` | 3 | — | trivial |
| `i18n` | 2 | — | `next-intl` |
| `pdf` | 1 (planeado) | — | `@react-pdf/renderer` |
| `flow-registro-aprobacion` | 2 | — | `zazpi` + `landing-golf` |
| `flow-portal-documentos` | 1 | — | |
| `flow-checkout-comprobante` | 1 | — | |

Los que no están en la primera ronda tienen dueño identificado y llegan por
`/main-design-extract` cuando el trabajo real los pida.

### Joyas sueltas, candidatas a extracción
Ya escritas una vez, reutilizables: `unsubscribe-token.ts`, `signed-url.ts`,
`subscription-access.ts`, `tz.ts`, `slug.ts`, `status-tones.ts`, `tenant.ts`, `qr.ts`.

---

## 6. Anatomía de un módulo

```
modules/<nombre>/
  registry-item.json      # nombre, tipo, files, dependencies, registryDependencies
  CHANGELOG.md            # severidad + síntoma (D12)
  SKILL.md                # reglas de uso, se instala en .claude/skills/<nombre>/
  files/
    lib/<nombre>/
      contract.ts         # tipos + Zod + constantes. Portable (D07)
      server.ts
      client.ts
    db/schema/<nombre>.ts  # si aplica
    app/api/...            # si aplica
```

Reglas:
- Todo archivo instalado abre con la marca de versión (`D12`).
- `contract.ts` sin imports de `next/*`, `react` ni Tailwind (`D07`).
- Cero paleta cruda de Tailwind en cualquier `.tsx` (`D11`).
- Las pantallas de referencia abren con `// REFERENCIA: reemplazar por la UI de marca`.

---

## 7. Estructura del repo

Revisado tras scaffoldear el proyecto real (§8, tarea 2): **no hay una carpeta
`modules/*/files/`**. Eso habría duplicado cada archivo (una copia viva en la app,
otra en `modules/`), justo el tipo de fuente-de-verdad-doble que este kit existe
para evitar. El patrón real, tomado de la documentación oficial de registro de
shadcn: la app es la única fuente, y `registry-item.json` de cada módulo apunta a
las rutas reales de la app. `modules/<nombre>/` es metadata pura:
`registry-item.json` + `CHANGELOG.md` + `SKILL.md`, nada de código.

```
main-design-template/
  PLAN.md                      # este documento
  AGENTS.md                    # convenciones del kit (D04) + bloque autogenerado de Next
  package.json / tsconfig.json / components.json / next.config.ts / ...

  app/                         # Next.js real — compila, no es una copia de referencia
  components/
    ui/                        # shadcn (button, ...)
    states/                    # empty/error/forbidden-state.tsx (base)
  lib/
    utils.ts                   # cn() — de `shadcn init`, no del kit
    result.ts / env.ts / errors/   (base)
  design-system/tokens.json    # fuente de tokens (tokens)
  scripts/                     # generador de tokens (tokens)
  styles/tokens.css            # generado, no editar a mano (tokens)
  tests/tokens.test.ts         # test de drift (tokens)
  instrumentation.ts           # captura de errores de servidor (base)

  modules/                     # METADATA de cada módulo, no código
    tokens/  { registry-item.json, CHANGELOG.md, SKILL.md }
    base/    { registry-item.json, CHANGELOG.md, SKILL.md }
    ...

  themes/
    <cliente>/tokens.json       # cuando haya más de un cliente/marca

  .claude-plugin/
    marketplace.json            # canal de skills
  plugins/main-design/
    skills/
      main-design-start/
      main-design-add/
      main-design-extract/
      main-design-audit/

  registry.json                 # generado desde modules/*/registry-item.json
  public/r/                     # salida de `npx shadcn build` (generado, no se versiona)
```

---

## 8. Primera ronda — tareas concretas

1. ✅ `git init`. Falta: repo en GitHub (privado).
2. ✅ **Cerrado.** `npx shadcn@latest init --template next -d --base radix -n
   main-design-template` (en scratch, luego movido a la raíz sin anidar — `init`
   crea una subcarpeta con el nombre del proyecto, incluso si coincide con el
   directorio actual). Hallazgos reales de correr esto, no hipótesis de la
   documentación:
   - **`--base` importa: sin especificarlo, el CLI instala `@base-ui/react`
     (Base UI), no Radix.** De los 18 proyectos auditados, solo `solvo` usa
     Radix (13 paquetes `@radix-ui/react-*`) y ninguno usa Base UI. Se fijó
     `--base radix` explícitamente — la evidencia del portafolio manda sobre
     el default del CLI.
   - **El bug del `--font-sans` circular no aplica a este flujo.** Se verificó
     compilando de verdad (`next build` + inspección del CSS/HTML generado):
     `next/font` inyecta `--font-sans` con un valor real en la misma clase que
     se aplica a `<html>`, y `@theme inline` lo referencia correctamente
     (`inline` en Tailwind v4 difiere la resolución a runtime — lo contrario de
     lo que decía la documentación cargada). El bug ocurre al correr `init`
     sobre un `layout.tsx` YA EXISTENTE que no usa ese mismo nombre de
     variable, no en un scaffold nuevo. Sin acción, dato corregido.
   - **`cn()` cambió de implementación.** El CLI actual (`shadcn@4.21`) escribe
     `lib/utils.ts` como `export { cn } from "cn"` (paquete npm), no
     `clsx`+`tailwind-merge` como en los 18 proyectos. `base` tenía su propio
     `lib/utils.ts` compitiendo por la misma ruta — se quitó el de `base` (ver
     `modules/base/CHANGELOG.md`).
   - **Conflicto real con `tokens`:** el scaffold trae `next-themes` +
     `ThemeProvider` (toggle claro/oscuro por clase, atajo de teclado). `tokens`
     asume un solo tema por marca (D03). Se quitaron ambos del proyecto de
     referencia (ver `modules/tokens/CHANGELOG.md`).
   - **`tokens.json`/`generate-tokens.mjs` asumían `src/`** (estructura de
     `zazpi`). Este scaffold no usa `src/` — corregido a `styles/tokens.css` en
     la raíz, con el generador comentando cómo ajustarlo si el proyecto sí usa
     `src/`.
   - Verificado con un build real, no solo típico: `bg-red-600` forzado en una
     página compila sin error pero Tailwind no genera ninguna regla para esa
     clase — confirma el mecanismo de `D09`/`D11`, y corrigió la redacción
     ("no es un error de build", como se documentó antes en varios lugares).
   - `npm run lint` falla con un error interno de ESLint 10 +
     `eslint-plugin-react` (`contextOrFilename.getFilename is not a function`)
     — confirmado que ocurre también en `app/page.tsx`, generado por el
     scaffold sin tocar. Es una incompatibilidad de versiones del propio
     scaffold de shadcn/Next, no algo introducido por `tokens`/`base`. No se
     parcheó (fuera de alcance de esta tarea) — build, typecheck y vitest sí
     pasan limpios, y son la verificación que importa para los módulos.
3. ✅ **`tokens`** — construido e integrado en la app real. Extraído de `zazpi`
   (`design-system/tokens.json`, `scripts/generate-tokens.mjs`,
   `scripts/lib/build-tokens-css.mjs`, `tests/tokens.test.ts`) y generalizado con
   valores placeholder + alias de shadcn (`D09`, + `--font-heading` agregado al
   integrar). Test de drift corrido dentro de la app real con `npm run test`
   (pasa en limpio, falla con un cambio manual sin regenerar). El reset de
   paleta cruda confirmado con un build real, no solo leído en la fuente.
4. ✅ **`base`** — construido e integrado en la app real. `lib/env.ts` (Zod v4),
   `lib/result.ts`, `lib/errors/reference-code.ts` + `instrumentation.ts` +
   `app/error.tsx` (comparten el mismo código de referencia sin transportar
   estado), `components/states/{empty,error,forbidden}-state.tsx` (sobre
   `Button` de shadcn vía `registryDependencies` — primera comprobación real de
   `D02`), `AGENTS.md` fusionado con el bloque autogenerado de Next (`D04`).
   `npm run build` + `tsc --noEmit` limpios sobre el conjunto completo
   (scaffold + tokens + base), no solo cada módulo por separado.
5. **`db`** — Neon + Drizzle + `drizzle.config.ts` + convención de un archivo por
   tabla en `db/schema/`.
6. **`auth`** — **fusionar `solvo` + `landing-golf`**. Ninguno de los dos archivos es
   el módulo por sí solo:

   | De `solvo` | De `landing-golf` |
   |---|---|
   | link directo al token: evita el iframe sandboxed de clientes de correo | capturar la URL de reset sin enviar email, para resets disparados por admin o webhook de Stripe |

   Ambas cicatrices entran, y ambas se documentan en el `CHANGELOG` por síntoma.
7. **`email`** — Resend + React Email, plantilla base bilingüe 600px sin depender de
   fuentes web.
8. Las 4 skills (`D08`) + `marketplace.json`.
9. Publicar en Vercel con `REGISTRY_TOKEN`.
10. **Validar en el siguiente proyecto real**, no antes de eso.

---

## 9. Deuda detectada en proyectos existentes

Hallazgos de la auditoría que no son del kit pero conviene arreglar:

- [ ] `zazpi/CLAUDE.md` declara **Auth.js** — better-auth es la decisión real (`D05`).
      Instruye el stack equivocado a cualquier agente que retome el proyecto.
- [ ] `zazpi/CLAUDE.md` declara **pnpm** — 6 de 9 proyectos usan npm.
- [ ] `landing-golf` **le falta el arreglo del iframe sandboxed** en el reset de
      contraseña que `solvo` ya tiene. Es un bug vivo, no una inconsistencia de estilo.
- [ ] `landing-golf/app/(auth)/` tiene 8 clases de paleta cruda y 0 tokens semánticos.
- [ ] `que-veo/packages/shared` es un paquete vacío (solo `package.json` v0.0.0).

---

## 10. No decidido

- Host y dominio del registro.
- Formato exacto de `CHANGELOG.md` (¿legible por la skill de auditoría, o texto libre?).
- Si `theme-<cliente>` se distribuye como ítem `registry:base` o como preset de shadcn.
- Cuándo, si alguna vez, se crea `kit-expo` (`D07`).
