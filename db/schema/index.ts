// kit: db@1
//
// Un archivo por tabla en este directorio (`db/schema/<tabla>.ts`),
// reexportado aquí con `export * from "./<tabla>"`. Nunca definir una tabla
// directamente en este archivo — es solo el barrel.
//
// Vacío a propósito: no se envía una tabla de ejemplo. Una tabla inventada
// ("posts", "users" genérico) es más ruido que ayuda — se borra en el primer
// commit real de cualquier proyecto. Empezar por la primera tabla de negocio.
export {};
