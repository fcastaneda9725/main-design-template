// kit: base@1
//
// Forma estándar de retorno de Server Actions y route handlers, documentada como
// convención en varios proyectos ("Server Actions devuelven
// `{ ok: true, data } | { ok: false, error, ref }`") y ahora formalizada como tipo.
//
// `ref` es opcional a propósito: no todo error de negocio merece un código de
// referencia (un campo de formulario inválido, no). Se reserva para errores que
// un usuario podría necesitar reportar a soporte — normalmente generado con
// `generateReferenceCode()` de `lib/errors/reference-code.ts`.

export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E; ref?: string };

export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

export function err<E = string>(error: E, ref?: string): Result<never, E> {
  return { ok: false, error, ref };
}
