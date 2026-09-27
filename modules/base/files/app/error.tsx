// kit: base@1
"use client";

import { referenceCodeFromDigest } from "@/lib/errors/reference-code";
import { ErrorState } from "@/components/states/error-state";

/**
 * Boundary de error de Next.js App Router. El código de referencia sale del
 * `digest` que Next adjunta al error en el servidor, así que es exactamente el
 * mismo que `instrumentation.ts` registró: soporte puede buscarlo sin pedir
 * capturas de pantalla.
 *
 * Si el proyecto usa i18n (next-intl u otro), reemplazar los textos fijos de
 * `ErrorState` por las claves de traducción correspondientes — no duplicar
 * este archivo, solo pasarle `title`/`description` traducidos.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Sin digest no hubo error de servidor (falló el propio cliente): no hay nada
  // que buscar en analítica con un código, así que no se inventa uno.
  const referenceCode = error.digest ? referenceCodeFromDigest(error.digest) : undefined;

  return (
    <main className="flex min-h-[60vh] flex-1 flex-col items-center justify-center">
      <ErrorState referenceCode={referenceCode} onRetry={reset} />
    </main>
  );
}
