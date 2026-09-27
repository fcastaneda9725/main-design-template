// kit: base@1
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Estado de error presentacional. Recibe el código de referencia ya calculado
 * (con `referenceCodeFromDigest` en el boundary, o `generateReferenceCode` en
 * un error de negocio) — este componente no sabe de dónde salió, solo lo
 * muestra con botón de copiar. Reusable dentro de `app/error.tsx` y en
 * cualquier otro punto de la app donde una operación falle sin recargar la
 * página entera (una carga de datos, un submit).
 */
export function ErrorState({
  title = "Algo salió mal",
  description = "Ocurrió un error inesperado. Intenta de nuevo o contacta soporte con el código de abajo.",
  referenceCode,
  onRetry,
}: {
  title?: string;
  description?: string;
  referenceCode?: string;
  onRetry?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!referenceCode) return;
    try {
      await navigator.clipboard.writeText(referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles el código sigue visible y se puede seleccionar.
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-foreground font-medium">{title}</p>
      <p className="max-w-prose text-sm text-muted-foreground">{description}</p>

      {referenceCode && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Código de referencia:</span>
          <code className="tracking-wide">{referenceCode}</code>
          <button type="button" onClick={copy} className="text-primary underline">
            {copied ? "Copiado" : "Copiar"}
          </button>
        </p>
      )}

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
