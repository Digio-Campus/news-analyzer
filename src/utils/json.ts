// Extrae el campo 'available' de un JSON y devuelve el valor booleano que contiene.
export function evalAvailable(json: any, fieldPath: string): boolean {
  return fieldPath.split('.').reduce((acc, key) => acc?.[key], json);
}

// Extrae el campo 'count' de un JSON y devuelve el valor numérico que contiene.
export function evalCount(json: any, fieldPath: string): number {
  return parseInt(fieldPath.split('.').reduce((acc, key) => acc?.[key], json));
}
