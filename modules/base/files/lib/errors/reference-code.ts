// kit: base@1
import { customAlphabet } from "nanoid";

// 8 caracteres, alfabeto Crockford sin 0/O, 1/I/L, U — nada que se confunda al
// dictarlo por teléfono. Ej. "7K4QXD2M". Se muestra en pantalla con botón de
// copiar y, si el proyecto tiene un módulo de analítica/errores instalado, va
// como property del evento correspondiente para que soporte lo pueda buscar.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

export const generateReferenceCode = customAlphabet(ALPHABET, 8);

/**
 * Variante determinista para errores de renderizado. Next genera un `digest` por
 * error y se lo pasa tanto a `onRequestError` (servidor, ver `instrumentation.ts`)
 * como al boundary `app/error.tsx` (cliente), pero nunca el mismo código aleatorio
 * a los dos. Derivando el código del digest, la pantalla del usuario y el evento
 * de analítica/errores coinciden sin transportar nada entre servidor y cliente.
 *
 * El digest ya es un hash; esto solo lo reescribe en el alfabeto de arriba.
 */
export function referenceCodeFromDigest(digest: string): string {
  // FNV-1a de 32 bits: barato, estable entre runtimes y suficiente aquí — no es
  // un hash criptográfico y no debe usarse como tal.
  let hash = 0x811c9dc5;
  for (let i = 0; i < digest.length; i++) {
    hash ^= digest.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  let code = "";
  for (let i = 0; i < 8; i++) {
    code += ALPHABET[hash % ALPHABET.length];
    // Se vuelve a mezclar en cada vuelta para que los 8 caracteres no sean
    // simplemente el mismo número en base 30 con los dígitos altos casi fijos.
    hash = (((Math.imul(hash, 0x01000193) >>> 0) ^ (hash >>> 7)) >>> 0);
  }

  return code;
}
