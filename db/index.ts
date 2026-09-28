// kit: db@1
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Driver HTTP (sin sesión persistente): funciona en serverless y, verificado
// en producción (`solvo`, con better-auth + drizzleAdapter encima), también
// para flujos autenticados — no hace falta el driver de sesión (Pool,
// WebSocket) solo porque el proyecto tenga auth. Cambiar a
// `drizzle-orm/neon-serverless` + `Pool` únicamente si el proyecto necesita
// transacciones multi-sentencia reales, que `neon-http` no soporta bien.
const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema });
