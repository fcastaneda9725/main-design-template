// kit: base@1
import type { Instrumentation } from "next";
import { referenceCodeFromDigest } from "@/lib/errors/reference-code";

/**
 * Único punto donde se capturan los errores no manejados del servidor. Next
 * llama a esto para cualquier error lanzado en Server Components, Server
 * Actions, route handlers o middleware, con el mismo `digest` que después
 * recibe el boundary `app/error.tsx` — de ahí sale el código que ve el usuario.
 *
 * Sin proveedor de analítica/errores instalado todavía: se registra en consola
 * del servidor con el código de referencia, para que al menos quede buscable en
 * los logs de la plataforma de hosting. Al instalar el módulo `analytics`,
 * reemplazar el `console.error` de abajo por su captura (ver el SKILL.md de
 * ese módulo) — no envolver ni duplicar este archivo.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: unknown }).digest ?? "")
      : "";

  const referenceCode = digest ? referenceCodeFromDigest(digest) : undefined;

  // Sin PII: ruta y tipo de renderizado, nunca query strings ni cabeceras.
  console.error("[server-error]", {
    referenceCode,
    path: request.path,
    router: context.routerKind,
    routeType: context.routeType,
    error,
  });
};
