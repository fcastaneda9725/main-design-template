// kit: email@1
import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { ok, err, type Result } from "@/lib/result";

// Instancia única, creada al primer uso — mismo patrón que cualquier cliente
// singleton lazy (evita crearla si el proyecto nunca llega a mandar un correo
// en esa ejecución, p. ej. en build).
let client: Resend | null = null;

export function getResendClient(): Resend {
  if (!client) client = new Resend(env.RESEND_API_KEY);
  return client;
}

/**
 * Envía un correo ya renderizado a HTML. Todo envío pasa por aquí — nunca
 * llamar `resend.emails.send()` directo desde otro archivo.
 *
 * Resend **no lanza** en fallos de la API (llave inválida, dominio no
 * verificado, destinatario rechazado…): regresa `{ data: null, error }`. Sin
 * este chequeo, un envío rechazado pasa silenciosamente como éxito — esto ya
 * pasó en producción. Un fallo de red sí lanza (fetch), por eso el caller
 * puede envolver esta función en su propio try/catch si necesita capturarlo.
 */
export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<Result<void>> {
  const { error } = await getResendClient().emails.send({
    from: env.EMAIL_FROM,
    to: args.to,
    subject: args.subject,
    html: args.html,
    ...(args.replyTo ? { replyTo: args.replyTo } : {}),
  });

  if (error) return err(error.message || "Resend rechazó el envío del correo");
  return ok(undefined);
}
