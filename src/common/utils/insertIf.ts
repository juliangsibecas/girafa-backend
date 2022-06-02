export function insertObjectIf<T = unknown>(
  condition: boolean,
  obj: Record<string, T>,
): Record<string, T> {
  return condition ? obj : {};
}

export const insertArrayIf = (condition: boolean, arr: Array<unknown>) =>
  condition ? arr : [];
