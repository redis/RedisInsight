/**
 * Retry options
 */
export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  errorMessage?: string;
}

/**
 * Retry a function until it succeeds or max attempts reached
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Result of the function
 * @throws Error if all attempts fail
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxAttempts = 5, delayMs = 1000, errorMessage } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  const message = errorMessage || `Failed after ${maxAttempts} attempts`;
  throw new Error(`${message}: ${lastError?.message}`);
}
