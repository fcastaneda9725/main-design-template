// kit-only: no se instala en proyectos consumidores (no forma parte de ningún
// módulo). Protege /r/*.json — sin esto, REGISTRY_TOKEN en components.json
// (D13) sería decorativo: cualquiera con la URL leería el registro sin el
// header Authorization.
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = process.env.REGISTRY_TOKEN;

  if (!token) {
    console.error("REGISTRY_TOKEN no está configurado — bloqueando /r/* por defecto.");
    return NextResponse.json({ error: "registry misconfigured" }, { status: 500 });
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${token}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/r/:path*",
};
