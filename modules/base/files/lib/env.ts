// kit: base@1
//
// Motor de validación de entorno: separa variables de servidor y de cliente,
// falla rápido con mensaje claro si falta algo al arrancar, y expone un solo
// objeto `env` tipado. Extraído del patrón usado en producción (zazpi §15).
//
// Cada módulo que se instale después (db, auth, email, payments...) añade sus
// propias variables a `serverSchema` o `clientSchema` — este archivo se edita,
// no se envuelve. El único campo que trae `base` es `NEXT_PUBLIC_APP_URL`,
// presente en prácticamente todo proyecto (usado para construir URLs absolutas
// en emails, webhooks y redirects).
import { z } from "zod";

const serverSchema = z.object({
  // Ejemplo de cómo un módulo futuro se engancha aquí:
  // DATABASE_URL: z.string().url(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

// Next.js solo reemplaza `process.env.NEXT_PUBLIC_*` cuando el acceso es estático
// (esta forma literal, no un bucle ni una clave calculada) — así llega también al
// bundle de cliente. Si se agrega una var pública nueva, se agrega también aquí.
const clientEnv = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

const isServer = typeof window === "undefined";

const parsed = isServer
  ? serverSchema.merge(clientSchema).safeParse({ ...process.env, ...clientEnv })
  : clientSchema.safeParse(clientEnv);

if (!parsed.success) {
  console.error(
    "❌ Variables de entorno inválidas o faltantes:",
    z.treeifyError(parsed.error),
  );
  throw new Error("Variables de entorno inválidas — revisa .env.local contra lib/env.ts");
}

export const env = parsed.data as z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;
