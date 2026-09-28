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

// kit: email@1
// Resend acepta dos formas en el remitente: "correo@dominio" y
// "Nombre <correo@dominio>". La segunda es la que ve el destinatario, así que
// se valida solo la dirección adentro, no la cadena completa — `z.email()` a
// secas rechazaría el nombre visible.
const emailFrom = z.string().refine(
  (value) => {
    const withDisplayName = value.match(/^[^<>]*<([^<>]+)>$/);
    const address = (withDisplayName ? withDisplayName[1] : value).trim();
    return z.email().safeParse(address).success;
  },
  { message: "Debe ser 'correo@dominio' o 'Nombre <correo@dominio>'" },
);

const serverSchema = z.object({
  // kit: db@1
  DATABASE_URL: z.string().url(),
  // kit: auth@1
  BETTER_AUTH_SECRET: z.string().min(32, "Genera uno con: openssl rand -base64 32"),
  // kit: email@1
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: emailFrom,
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
