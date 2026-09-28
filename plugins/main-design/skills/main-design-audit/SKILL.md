---
name: main-design-audit
description: Reporta qué módulos del kit main-design están desactualizados en el proyecto actual, comparando las marcas de versión instaladas contra el CHANGELOG de cada módulo. Nunca actualiza nada por sí sola. Se activa cuando el usuario pregunta si sus módulos del kit están al día o quiere un reporte de deriva.
---

# main-design-audit

Reporta. Nunca actualiza sola — toda la razón de `D01` fue que los
proyectos puedan divergir intencionalmente del kit; un auto-update pelearía
contra esa decisión fundacional (`D12`).

## 1. Encontrar módulos instalados

Buscar en el proyecto la marca de versión que cada archivo instalado
debería llevar al inicio:

```bash
grep -rn "^// kit: " --include="*.ts" --include="*.tsx"
```

Cada línea tiene la forma `// kit: <módulo>@vN · <hash corto> · <fecha>` o,
si el proyecto marcó divergencia intencional,
`// kit: <módulo>@vN · divergido: <razón>`.

## 2. Comparar contra el kit

Para cada módulo encontrado, leer `modules/<módulo>/CHANGELOG.md` en el
repo `main-design-template` (local si está disponible, o la URL cruda de
GitHub una vez publicado — ver `PLAN.md` §8 tarea 1) y encontrar el `## vN`
más alto.

- Si `N` instalado == `N` más alto del kit → al día, no reportar.
- Si `N` instalado < `N` más alto → desactualizado, listar cada versión
  intermedia.

## 3. Respetar la divergencia intencional

Si la marca dice `divergido: <razón>`, **no reportarlo como desactualizado**
— la auditoría respeta esa nota y deja de molestar con ese módulo. Sin este
paso la herramienta se vuelve ruido y se ignora en dos meses (`D12`,
condición 2).

## 4. Formato del reporte

Por módulo desactualizado, listar cada versión intermedia con severidad y
síntoma — nunca el mensaje técnico genérico del `CHANGELOG.md`, sino la
frase que hace reaccionar:

```
payments@3  → hay payments@5
   v4  fix  el webhook cobraba doble cuando Stripe reenviaba el mismo event.id
   v5  feat soporte de MercadoPago
```

- `fix-seguridad` y `fix` son las únicas severidades que ameritan interrumpir
  al usuario de forma destacada — resaltarlas primero.
- `feat` y `chore` se listan pero no urgen.

## 5. Qué hacer si el usuario pide aplicar una actualización

Eso no es trabajo de esta skill — es una llamada a `main-design-add` sobre
ese módulo específico, con confirmación explícita del usuario primero.
Advertir antes: reinstalar sobre un archivo con divergencia no marcada
pierde esa divergencia silenciosamente.

## Qué NO hace esta skill

- No modifica ningún archivo del proyecto.
- No corre `npx shadcn add` de nada.
- No asume que falta la marca de versión significa que el módulo no está
  instalado — puede ser un módulo instalado antes de que existiera esta
  convención; reportarlo aparte como "sin marca, no se puede auditar" en vez
  de omitirlo en silencio.
