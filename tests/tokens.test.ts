// kit: tokens@1
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildTokensCss } from "../scripts/lib/build-tokens-css.mjs";
import tokens from "../design-system/tokens.json";

// Ruta alineada con OUT_PATH en scripts/generate-tokens.mjs — si ese script
// cambia de destino (p. ej. a src/styles/tokens.css en un proyecto con src/),
// esta ruta se actualiza igual.
describe("design-system/tokens.json → styles/tokens.css", () => {
  it("el CSS commiteado es exactamente el que generaría scripts/generate-tokens.mjs hoy", () => {
    const committed = readFileSync(
      join(__dirname, "../styles/tokens.css"),
      "utf8",
    );
    const regenerated = buildTokensCss(tokens);

    expect(committed).toBe(regenerated);
  });
});
