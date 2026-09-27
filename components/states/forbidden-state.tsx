// kit: base@1
import { Button } from "@/components/ui/button";

/**
 * "No tienes permiso" — distinto de un 404 (el recurso no existe) y distinto
 * de `EmptyState` (el recurso existe pero está vacío). Se usa cuando el rol
 * actual no puede ver o actuar sobre algo específico, nunca ocultando el botón
 * y ya: la autorización siempre se decide en servidor, esta pantalla es lo que
 * se muestra cuando esa decisión ya se tomó.
 */
export function ForbiddenState({
  title = "No tienes acceso a esta sección",
  description = "Si crees que deberías poder verla, contacta a quien administra tu cuenta.",
  homeHref = "/",
}: {
  title?: string;
  description?: string;
  homeHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-foreground font-medium">{title}</p>
      <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      <Button asChild variant="outline" size="sm">
        <a href={homeHref}>Volver al inicio</a>
      </Button>
    </div>
  );
}
