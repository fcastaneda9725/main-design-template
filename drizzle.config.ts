// kit: db@1
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit corre fuera del pipeline de env de Next.js (es un proceso de
// CLI aparte), así que carga su propio .env.local en vez de pasar por
// lib/env.ts.
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL en .env.local — revisa lib/env.ts.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
