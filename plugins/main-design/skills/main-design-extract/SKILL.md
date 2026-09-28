---
name: main-design-extract
description: Convierte código que ya funciona en producción en un proyecto real en un módulo nuevo del kit main-design. Se activa cuando el usuario quiere agregar un módulo al catálogo del kit a partir de algo ya construido (payments, storage, analytics, un flow-*, o cualquier lib/ que se repitió en más de un proyecto).
---

# main-design-extract

La skill más importante de las cuatro (`PLAN.md` `D08`). Un catálogo que se
llena adivinando por adelantado se muere; uno que se alimenta de lo que ya
funcionó en producción crece solo. Nunca construir un módulo especulativo
sin código real de origen.

## 0. Verificar que corresponde extraer, no adivinar

Antes de empezar: ¿hay código real, ya en producción, que se está copiando?
Si la respuesta es "no, pero se me ocurre que hará falta" — parar. Eso
contradice la regla de proceso del kit. Sugerir esperar al primer proyecto
real que lo necesite.

## 1. Leer el código real

Leer la carpeta/feature de origen completa, no un resumen. Entender qué es
invariante de negocio y qué es específico del cliente origen.

## 2. Buscar una segunda implementación

Antes de generalizar desde un solo proyecto, buscar si otro proyecto del
portafolio ya resolvió lo mismo por su cuenta (así se construyó `auth`:
fusión real de `solvo` + `landing-golf`, ninguno de los dos archivos era el
módulo por sí solo). Si existe una segunda implementación:

- Comparar ambas línea por línea.
- Tomar el mejor fix de cada una — no promediar ni elegir una y descartar la
  otra sin mirar qué resuelve la que se descarta.
- Documentar en el `CHANGELOG.md` del módulo nuevo, por archivo, qué vino de
  dónde y por qué (el mismo formato que `modules/auth/CHANGELOG.md`).

## 3. Aplicar la frontera portable (`D07`)

Si el módulo tiene lógica de negocio no trivial, separar:

```
lib/<módulo>/
  contract.ts   # tipos + Zod + constantes. Sin imports de next/*, react, Tailwind
  server.ts     # proveedor, DB, server-only
  client.ts     # hooks, React
```

No aplica a todo — un módulo puramente de cableado (como `email`) no
necesita las tres capas. No fuerces la estructura donde no hay lógica
portable que proteger.

## 4. Abstraer solo con variación observada (`D06`)

Antes de crear una interfaz (`PaymentProvider`, algo `-Provider`), confirmar
que hay **al menos dos** implementaciones reales y divergentes en el
portafolio con una razón de negocio, no solo de gusto. Con una sola
implementación, copiar directo — la interfaz es deuda hasta que exista una
segunda variante real que la justifique.

## 5. Generalizar

Quitar nombres y lógica específicos del cliente de origen. Ejemplo ya
resuelto en este kit: `createStaffUser` (SQL crudo, específico de
"taquilla"/golf) → `createUserWithPassword(email, name, password)` genérico,
sobre Drizzle, devolviendo `Result<string>`.

## 6. Colocar el código en la app de referencia

Este repo (`main-design-template`) es una app Next.js real que compila —
**no** existe una carpeta `modules/*/files/` (`D02`, §7). El código va una
sola vez, en su ruta real dentro de la app (`lib/`, `db/schema/`, `app/`),
igual que los 5 módulos existentes.

## 7. Escribir los tres archivos de metadata

`modules/<nombre>/`:

- **`registry-item.json`** — `files` apunta a las rutas reales de la app.
  Incluir siempre el propio `SKILL.md` del módulo como archivo instalable:
  ```json
  { "path": "modules/<nombre>/SKILL.md", "target": ".claude/skills/<nombre>/SKILL.md", "type": "registry:file" }
  ```
  (Los 5 módulos existentes tenían este gap — no lo repitas.)
- **`CHANGELOG.md`** — formato `## v1` con entradas `feat`/`fix`/
  `fix-seguridad`/`chore`, redactadas por síntoma
  ("el link de reset no funcionaba al hacer click desde Gmail"), nunca por
  mecanismo genérico ("arregla el manejo de URL"). Primera entrada = de
  dónde salió el módulo y qué bug real resuelve.
- **`SKILL.md`** — reglas duras del módulo (mismo formato que
  `modules/auth/SKILL.md`): qué no hacer nunca, qué pasos manuales de
  instalación quedan pendientes, qué NO trae el módulo.

## 8. Reglas de pantallas de referencia, si el módulo trae una

- Cero paleta cruda de Tailwind — solo tokens semánticos.
- Primera línea del archivo: `// REFERENCIA: reemplazar por la UI de marca`.

## 9. Regenerar el registro y verificar con build real

```bash
npm run registry:build   # regenera registry.json + public/r/*.json
npm run build
npx tsc --noEmit
npm run test             # si el módulo trae tests
```

No declarar el módulo listo por lectura de código — verificar con el build
real de este repo, igual que se hizo con los 5 módulos existentes (incluye
casos negativos cuando aplique: quitar una env var requerida y confirmar que
el build falla con el mensaje esperado).

## 10. Actualizar `PLAN.md`

Marcar el módulo como ✅ construido en la tabla del catálogo (§5). Si el
proyecto de origen tenía deuda que no se debe replicar, anotarla en §9.
