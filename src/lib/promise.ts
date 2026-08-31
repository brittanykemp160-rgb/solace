// Promise utilities

export const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ]);
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const settled = async <T>(promises: Promise<T>[]): Promise<PromiseSettledResult<T>[]> => {
  return Promise.allSettled(promises);
};

export const sequential = async <T>(tasks: (() => Promise<T>)[]): Promise<T[]> => {
  const results: T[] = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
};

export const concurrent = async <T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> => {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const p = task().then(r => { results.push(r); });
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(e => e === p), 1);
    }
  }

  await Promise.all(executing);
  return results;
};
