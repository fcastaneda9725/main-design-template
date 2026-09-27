// kit: base@1
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * Estado vacío estándar: una lista, tabla o panel sin datos todavía. Distinto
 * de `ErrorState` (algo falló) y de `ForbiddenState` (no tiene permiso) — los
 * tres son estados obligatorios en toda vista que muestra datos.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border px-6 py-16 text-center">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <p className="text-foreground font-medium">{title}</p>
      {description && (
        <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}
