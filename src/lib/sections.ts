/**
 * Indica se a seção `number` é o próprio `parent` ou um descendente dele
 * (prefixo com separador: "3.10" NÃO é filho de "3.1").
 */
export function isChildOf(number: string, parent: string): boolean {
  return number === parent || number.startsWith(parent + ".");
}
