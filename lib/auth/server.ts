// kit: auth@1
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { hashPassword } from "@better-auth/utils/password";
import { render } from "react-email";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user, session, account, verification } from "@/db/schema/auth";
import { env } from "@/lib/env";
import { ok, err, type Result } from "@/lib/result";
import { sendEmail } from "@/lib/email/server";
import { ResetPasswordEmail } from "@/emails/reset-password";

// kit: email@1 — conectado con el módulo `email`. Si `email` no está
// instalado todavía, quitar este import y volver al stub de `console.log`
// (ver `modules/auth/CHANGELOG.md` v1 para el texto original).
async function sendResetPasswordEmail(args: {
  email: string;
  name: string;
  resetUrl: string;
}) {
  const html = await render(
    ResetPasswordEmail({
      resetUrl: args.resetUrl,
      // TODO(proyecto): nombre de marca real — placeholder mientras no hay
      // uno definido.
      brandName: "Tu cuenta",
    }),
  );

  const result = await sendEmail({
    to: args.email,
    subject: "Recupera tu contraseña",
    html,
  });

  if (!result.ok) {
    console.error("[auth] no se pudo enviar el correo de reset:", result.error);
  }
}

// Admin/webhook-triggered: dispara el flujo de reset de better-auth y captura
// el link en vez de dejar que se envíe un correo. Ver `requestPasswordResetLink`.
const resetLinkCaptures = new Map<string, (url: string) => void>();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    async sendResetPassword({ user, token }) {
      // Link directo con el token crudo — nunca la `url` que arma better-auth
      // por su cuenta. Esa URL pasa por su propio endpoint de redirect, que
      // queda atrapado en el frame sandboxed de varios clientes de correo al
      // hacer click (encontrado en producción — ver CHANGELOG.md). El link
      // directo a la página del proyecto no tiene ese salto intermedio.
      const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

      const capture = resetLinkCaptures.get(user.email);
      if (capture) {
        // Disparado por requestPasswordResetLink — quien llamó decide qué
        // hacer con el link, no se envía ningún correo aquí.
        capture(resetUrl);
        resetLinkCaptures.delete(user.email);
        return;
      }

      await sendResetPasswordEmail({
        email: user.email,
        name: user.name || user.email.split("@")[0],
        resetUrl,
      });
    },
  },
  plugins: [admin({ defaultRole: "user" })],
  session: {
    cookieCache: {
      enabled: true,
      // 30s máximo: mantiene rápidas la mayoría de las requests públicas sin
      // que un cambio de rol tarde más que eso en reflejarse.
      maxAge: 30,
    },
  },
  // Login social — descomentar y agregar las variables a lib/env.ts si el
  // proyecto lo necesita. No viene activo por defecto: de los proyectos
  // auditados, solo uno usa OAuth.
  // socialProviders: {
  //   google: {
  //     clientId: env.GOOGLE_CLIENT_ID,
  //     clientSecret: env.GOOGLE_CLIENT_SECRET,
  //   },
  // },
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;

export async function getSession(headers: Headers): Promise<Session | null> {
  return auth.api.getSession({ headers });
}

/**
 * Da de alta un usuario con contraseña sin pasar por el flujo público de
 * registro — para altas hechas por un admin, un script de semilla, o un
 * webhook. El usuario cambia su contraseña con `requestPasswordResetLink`.
 */
export async function createUserWithPassword(
  email: string,
  name: string,
  password: string,
): Promise<Result<string>> {
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email));
  if (existing) return err("Ya existe un usuario con ese correo.");

  const userId = crypto.randomUUID();
  const hashed = await hashPassword(password);
  const now = new Date();

  await db.insert(user).values({
    id: userId,
    name,
    email,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashed,
    createdAt: now,
    updatedAt: now,
  });

  return ok(userId);
}

/**
 * Dispara el flujo de "olvidé mi contraseña" de better-auth y devuelve el
 * link directamente, sin que se envíe ningún correo — para flujos donde quien
 * llama decide qué hacer con el link (un webhook de pago que lo incluye en su
 * propio correo, un panel de admin que lo muestra una vez). Reemplaza el
 * patrón `auth.admin.generateLink()` de Supabase.
 */
export async function requestPasswordResetLink(email: string): Promise<Result<string>> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resetLinkCaptures.delete(email);
      resolve(err("No se pudo generar el link a tiempo."));
    }, 8000);

    resetLinkCaptures.set(email, (url) => {
      clearTimeout(timeout);
      resolve(ok(url));
    });

    auth.api
      .requestPasswordReset({
        body: {
          email,
          redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`,
        },
      })
      .catch(() => {
        clearTimeout(timeout);
        resetLinkCaptures.delete(email);
        resolve(err("No se pudo iniciar el flujo de reset."));
      });
  });
}
