// kit: db@1
//
// Un archivo por tabla en este directorio (`db/schema/<tabla>.ts`),
// reexportado aquí con `export * from "./<tabla>"`. Nunca definir una tabla
// directamente en este archivo — es solo el barrel.
//
// `auth.ts` es la única excepción a "una tabla por archivo": las 4 tablas de
// better-auth (user/session/account/verification) se generan y regeneran
// juntas con su CLI oficial — partirlas en 4 archivos serviría a la
// convención, no a la realidad de cómo se mantienen (ver el comentario en
// auth.ts).
export * from "./auth";
