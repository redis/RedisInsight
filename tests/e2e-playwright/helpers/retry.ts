/**
 * Retry options
 */
export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  errorMessage?: string;
  /** Multiplier applied to the delay after each attempt. 1 keeps it constant. */
  backoffFactor?: number;
}

/**
 * Retry a function until it succeeds or max attempts reached
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Result of the function
 * @throws Error if all attempts fail
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxAttempts = 5, delayMs = 1000, errorMessage, backoffFactor = 1 } = options;

  let lastError: Error | undefined;
  let delay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= backoffFactor;
      }
    }
  }

  const message = errorMessage || `Failed after ${maxAttempts} attempts`;
  throw new Error(`${message}: ${lastError?.message}`);
}
