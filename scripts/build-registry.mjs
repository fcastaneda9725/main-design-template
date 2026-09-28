// Ensambla registry.json a partir de modules/<nombre>/registry-item.json.
// No hay una segunda fuente de verdad: agregar un módulo nuevo es agregar su
// carpeta en modules/ y volver a correr esto (D12 — igual que tokens.css se
// genera desde tokens.json, nunca al revés).
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const modulesDir = "modules";
const names = readdirSync(modulesDir).sort();

const items = names.map((name) => {
  const raw = readFileSync(join(modulesDir, name, "registry-item.json"), "utf8");
  return JSON.parse(raw);
});

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "main-design-template",
  homepage: "https://main-design-template.vercel.app",
  items,
};

writeFileSync("registry.json", JSON.stringify(registry, null, 2) + "\n");
console.log(`registry.json generado con ${items.length} módulos: ${names.join(", ")}`);
