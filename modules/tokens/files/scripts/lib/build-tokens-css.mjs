// kit: tokens@1
//
// Lógica pura: tokens.json -> texto de tokens.css. Sin efectos de archivo, para
// poder importarla igual desde el CLI (scripts/generate-tokens.mjs) que desde el
// test que verifica "CSS generado ≡ tokens.json" (tests/tokens.test.ts, D10).
//
// Extraído y generalizado del pipeline de zazpi. La sección nueva respecto al
// original es el bloque de alias de shadcn (D09): el vocabulario propio
// (--bg-canvas, --text-primary…) es la fuente; --background, --foreground, etc.
// son alias derivados, nunca al revés.

const px = (n) => `${n}px`;
const line = (prop, value) => `  ${prop}: ${value};`;

function rootBlock(tokens) {
  const l = [];

  l.push("  /* color — superficie por defecto en todo el producto */");
  l.push(line("--bg-canvas", tokens.color.bg.canvas));
  l.push(line("--bg-surface", tokens.color.bg.surface));
  l.push(line("--bg-raised", tokens.color.bg.raised));
  l.push(line("--bg-inset", tokens.color.bg.inset));
  l.push(line("--text-primary", tokens.color.text.primary));
  l.push(line("--text-body", tokens.color.text.body));
  l.push(line("--text-muted", tokens.color.text.muted));
  l.push(line("--text-subtle", tokens.color.text.subtle));
  l.push(line("--text-disabled", tokens.color.text.disabled));
  l.push(line("--border-subtle", tokens.color.border.subtle));
  l.push(line("--border-default", tokens.color.border.default));
  l.push(line("--border-strong", tokens.color.border.strong));
  l.push(line("--brand", tokens.color.accent.default));
  l.push(line("--brand-hover", tokens.color.accent.hover));
  l.push(line("--brand-quiet", tokens.color.accent.quiet));
  l.push(line("--success", tokens.color.state.success));
  l.push(line("--warning", tokens.color.state.warning));
  l.push(line("--error", tokens.color.state.error));
  l.push(line("--info", tokens.color.state.info));
  l.push(line("--focus-ring", tokens.color.focusRing));
  l.push("");

  l.push("  /* escalas numeradas — uso puntual (gradientes, ilustración). Los roles de arriba son la referencia por defecto */");
  for (const [k, v] of Object.entries(tokens.color.neutral)) l.push(line(`--neutral-${k}`, v));
  for (const [k, v] of Object.entries(tokens.color.accentScale)) l.push(line(`--accent-${k}`, v));
  l.push("");

  l.push("  /* superficie clara — PDF, email, legales largos. No es un tema claro/oscuro, es una superficie fija para documentos (D09) */");
  l.push(line("--paper", tokens.color.paper.bg));
  l.push(line("--paper-alt", tokens.color.paper.bgAlt));
  l.push(line("--paper-ink", tokens.color.paper.ink));
  l.push(line("--paper-body", tokens.color.paper.body));
  l.push(line("--paper-muted", tokens.color.paper.muted));
  l.push(line("--paper-border", tokens.color.paper.border));
  l.push(line("--paper-accent-ink", tokens.color.paper.accentInk));
  l.push(line("--paper-accent-rule", tokens.color.paper.accentRule));
  l.push("");

  l.push("  /* tipografía */");
  l.push(line("--font-display", tokens.typography.family.display));
  l.push(line("--font-interface", tokens.typography.family.interface));
  l.push(line("--font-mono", tokens.typography.family.mono));
  l.push("");
  for (const s of tokens.typography.scale) {
    l.push(line(`--text-${s.token}-size`, px(s.sizeDesktop)));
    l.push(line(`--text-${s.token}-size-mobile`, px(s.sizeMobile)));
    l.push(line(`--text-${s.token}-line-height`, s.lineHeight));
    l.push(line(`--text-${s.token}-tracking`, s.tracking));
  }
  l.push("");

  l.push("  /* espaciado — base 4, coincide con la escala numérica por defecto de Tailwind 4 */");
  // "." no es válido dentro de un dashed-ident de CSS (p. ej. "0.5" rompería --space-0.5).
  for (const [k, v] of Object.entries(tokens.spacing)) l.push(line(`--space-${k.replace(".", "-")}`, px(v)));
  l.push("");

  l.push("  /* forma, elevación, capas, quiebres, movimiento */");
  for (const [k, v] of Object.entries(tokens.radius)) l.push(line(`--radius-${k}`, typeof v === "number" ? px(v) : v));
  for (const [k, v] of Object.entries(tokens.shadow)) l.push(line(`--shadow-${k}`, v));
  for (const [k, v] of Object.entries(tokens.zIndex)) l.push(line(`--z-${k}`, v));
  for (const [k, v] of Object.entries(tokens.breakpoint)) l.push(line(`--breakpoint-${k}`, px(v)));
  for (const [k, v] of Object.entries(tokens.motion.duration)) l.push(line(`--duration-${k}`, `${v}ms`));
  for (const [k, v] of Object.entries(tokens.motion.easing)) l.push(line(`--ease-${k}`, v));

  return l.join("\n");
}

function themeBlock(tokens) {
  const l = [];

  l.push("  /* resetea la paleta y la escala de radios por defecto de Tailwind: todo color y radio sale de tokens.json, nunca de la paleta de Tailwind (D09 / D11) */");
  l.push("  --color-*: initial;");
  l.push("  --radius-*: initial;");
  l.push("");

  l.push("  /* color — nombres cortos para utilidades propias (bg-canvas, text-primary, border-line...) */");
  l.push(line("--color-canvas", "var(--bg-canvas)"));
  l.push(line("--color-surface", "var(--bg-surface)"));
  l.push(line("--color-raised", "var(--bg-raised)"));
  l.push(line("--color-inset", "var(--bg-inset)"));
  l.push(line("--color-primary", "var(--text-primary)"));
  l.push(line("--color-body", "var(--text-body)"));
  l.push(line("--color-muted", "var(--text-muted)"));
  l.push(line("--color-subtle", "var(--text-subtle)"));
  l.push(line("--color-disabled", "var(--text-disabled)"));
  l.push(line("--color-line-subtle", "var(--border-subtle)"));
  l.push(line("--color-line", "var(--border-default)"));
  l.push(line("--color-line-strong", "var(--border-strong)"));
  l.push(line("--color-accent", "var(--brand)"));
  l.push(line("--color-accent-hover", "var(--brand-hover)"));
  l.push(line("--color-accent-quiet", "var(--brand-quiet)"));
  l.push(line("--color-success", "var(--success)"));
  l.push(line("--color-warning", "var(--warning)"));
  l.push(line("--color-error", "var(--error)"));
  l.push(line("--color-info", "var(--info)"));
  l.push(line("--color-focus-ring", "var(--focus-ring)"));
  l.push(line("--color-paper", "var(--paper)"));
  l.push(line("--color-paper-alt", "var(--paper-alt)"));
  l.push(line("--color-paper-ink", "var(--paper-ink)"));
  l.push(line("--color-paper-body", "var(--paper-body)"));
  l.push(line("--color-paper-muted", "var(--paper-muted)"));
  l.push(line("--color-paper-border", "var(--paper-border)"));
  for (const k of Object.keys(tokens.color.neutral)) l.push(line(`--color-neutral-${k}`, `var(--neutral-${k})`));
  for (const k of Object.keys(tokens.color.accentScale)) l.push(line(`--color-accent-${k}`, `var(--accent-${k})`));
  l.push("");

  l.push("  /* radios — solo los pasos definidos en tokens.json existen como utilidad */");
  for (const k of Object.keys(tokens.radius)) l.push(line(`--radius-${k}`, `var(--radius-${k})`));
  l.push("");

  l.push("  /* tipografía, quiebres, sombra, easing */");
  l.push(line("--font-display", "var(--font-display)"));
  l.push(line("--font-interface", "var(--font-interface)"));
  l.push(line("--font-mono", "var(--font-mono)"));
  l.push(line("--breakpoint-sm", px(tokens.breakpoint.sm)));
  l.push(line("--breakpoint-md", px(tokens.breakpoint.md)));
  l.push(line("--breakpoint-lg", px(tokens.breakpoint.lg)));
  l.push(line("--breakpoint-xl", px(tokens.breakpoint.xl)));
  l.push(line("--breakpoint-2xl", px(tokens.breakpoint["2xl"])));
  for (const k of Object.keys(tokens.shadow)) l.push(line(`--shadow-${k}`, `var(--shadow-${k})`));
  for (const k of Object.keys(tokens.motion.easing)) l.push(line(`--ease-${k}`, `var(--ease-${k})`));

  return l.join("\n");
}

// D09: capa de alias de shadcn. El vocabulario propio de arriba es el
// superconjunto; estos nombres son una proyección derivada, nunca la fuente.
// De 4 niveles de superficie se puede derivar 1-2 de shadcn; al revés es
// imposible — por eso el orden de generación no se invierte.
function shadcnAliasBlock() {
  const l = [];
  l.push("  /* alias de shadcn/ui — derivados de los tokens propios de arriba (D09). No editar: cualquier componente shadcn instalado los consume tal cual */");
  l.push(line("--background", "var(--bg-canvas)"));
  l.push(line("--foreground", "var(--text-primary)"));
  l.push(line("--card", "var(--bg-surface)"));
  l.push(line("--card-foreground", "var(--text-primary)"));
  l.push(line("--popover", "var(--bg-raised)"));
  l.push(line("--popover-foreground", "var(--text-primary)"));
  l.push(line("--primary", "var(--brand)"));
  l.push(line("--primary-foreground", "var(--bg-canvas)"));
  l.push(line("--secondary", "var(--bg-inset)"));
  l.push(line("--secondary-foreground", "var(--text-primary)"));
  l.push(line("--muted", "var(--bg-inset)"));
  l.push(line("--muted-foreground", "var(--text-muted)"));
  l.push(line("--accent", "var(--brand-quiet)"));
  l.push(line("--accent-foreground", "var(--text-primary)"));
  l.push(line("--destructive", "var(--error)"));
  l.push(line("--destructive-foreground", "var(--bg-canvas)"));
  l.push(line("--border", "var(--border-default)"));
  l.push(line("--input", "var(--border-default)"));
  l.push(line("--ring", "var(--focus-ring)"));
  l.push(line("--radius", "var(--radius-md)"));
  return l.join("\n");
}

export function buildTokensCss(tokens) {
  return `/* GENERADO por scripts/generate-tokens.mjs a partir de design-system/tokens.json — no editar a mano.
 * Regenerar: node scripts/generate-tokens.mjs (o el script npm "tokens" si el proyecto lo define).
 *
 * El espaciado no se remapea en @theme: la escala de tokens.json (base 4)
 * coincide con la escala numérica por defecto de Tailwind 4 (p-4 = 1rem = 16px).
 *
 * El tamaño de tipografía responsivo (desktop/mobile) vive en :root como
 * pares --text-{token}-size / --text-{token}-size-mobile; las clases que
 * aplican el quiebre responsivo se arman junto con las páginas que las usan.
 */

:root {
${rootBlock(tokens)}

  /* --- alias de shadcn (D09), fuera del bloque de tokens propios a propósito --- */
${shadcnAliasBlock()}
}

@theme inline {
${themeBlock(tokens)}
}
`;
}
