#!/usr/bin/env node
// kit: tokens@1
// GENERA styles/tokens.css a partir de design-system/tokens.json (D09/D10).
// No editar tokens.css a mano — correr este script después de tocar tokens.json.
//
// La ruta de salida es `styles/tokens.css` (raíz) porque este proyecto no usa
// `src/`. Si el proyecto donde se instala este módulo sí usa `src/`, ajustar
// OUT_PATH aquí a `src/styles/tokens.css` y el import en app/globals.css a
// juego — es lo único que depende de la convención de carpetas del proyecto.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildTokensCss } from "./lib/build-tokens-css.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TOKENS_PATH = join(ROOT, "design-system", "tokens.json");
const OUT_PATH = join(ROOT, "styles", "tokens.css");

const tokens = JSON.parse(readFileSync(TOKENS_PATH, "utf8"));
const css = buildTokensCss(tokens);

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, css, "utf8");
console.log(`tokens.css generado (${css.length} bytes) → ${OUT_PATH.replace(ROOT + "/", "")}`);
