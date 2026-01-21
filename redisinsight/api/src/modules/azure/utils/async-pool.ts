/**
 * Execute async functions with a concurrency limit.
 * Similar to Promise.all but limits the number of concurrent executions.
 *
 * @param items - Array of items to process
 * @param fn - Async function to apply to each item
 * @param concurrency - Maximum number of concurrent executions (default: 20)
 * @returns Array of results in the same order as input items
 */
export async function asyncPool<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number = 20,
): Promise<R[]> {
  const results: R[] = [];
  const executing: Set<Promise<void>> = new Set();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const promise = (async () => {
      try {
        results[i] = await fn(item);
      } catch (error) {
        results[i] = error as R;
        throw error;
      }
    })();

    const wrappedPromise = promise.then(
      () => {
        executing.delete(wrappedPromise);
      },
      () => {
        executing.delete(wrappedPromise);
      },
    );

    executing.add(wrappedPromise);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.allSettled(executing);

  return results;
}

/**
 * Execute async functions with a concurrency limit, collecting successful results only.
 * Failed operations are logged and skipped.
 *
 * @param items - Array of items to process
 * @param fn - Async function to apply to each item
 * @param concurrency - Maximum number of concurrent executions (default: 20)
 * @returns Array of successful results (may be shorter than input)
 */
export async function asyncPoolSettled<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number = 20,
): Promise<R[]> {
  const results: (R | null)[] = [];
  const executing: Set<Promise<void>> = new Set();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const promise = (async () => {
      try {
        results[i] = await fn(item);
      } catch {
        results[i] = null;
      }
    })();

    const wrappedPromise = promise.finally(() => {
      executing.delete(wrappedPromise);
    });

    executing.add(wrappedPromise);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.allSettled(executing);

  return results.filter((r): r is R => r !== null);
}
