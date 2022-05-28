export const insertObjectIf = (
  condition: boolean,
  obj: Record<string, unknown>,
) => (condition ? obj : {});

export const insertArrayIf = (condition: boolean, arr: Array<unknown>) =>
  condition ? arr : [];
