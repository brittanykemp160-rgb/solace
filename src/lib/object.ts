// Object utilities

export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  return keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {} as Pick<T, K>);
};

export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const copy = { ...obj };
  keys.forEach(key => delete copy[key]);
  return copy;
};

export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const merge = <T extends object>(...objects: Partial<T>[]): T => {
  return Object.assign({}, ...objects) as T;
};
