import { AsyncLocalStorage } from 'async_hooks';

/**
 * Request-scoped store that carries the name of the operation currently being
 * executed (e.g. "Load key list"). The Redis client layer reads it when
 * recording commands so the command log panel can group commands by the user
 * action that triggered them.
 *
 * This is intentionally a tiny standalone AsyncLocalStorage instead of a full
 * CLS package: the API does not depend on nestjs-cls and only needs a single
 * string carried across the async boundary of one HTTP request.
 */
export interface OperationContextStore {
  operation?: string;
}

export const operationContext = new AsyncLocalStorage<OperationContextStore>();

/**
 * Returns the operation name bound to the current async execution context,
 * or undefined when running outside of an HTTP request (background jobs,
 * startup probes, ...).
 */
export const getCurrentOperation = (): string | undefined =>
  operationContext.getStore()?.operation;

/**
 * Runs the callback with the given operation bound to the current context.
 * Exposed mainly for tests and non-HTTP entry points (e.g. WebSocket
 * handlers) that want their commands labelled too.
 */
export const runWithOperation = <T>(operation: string, callback: () => T): T =>
  operationContext.run({ operation }, callback);
