/**
 * Set text to the header result
 *
 */
export function setHeaderText(text?: string): void

/**
 * Execute Read-only Redis Command
 *
 */
export function executeRedisCommand(
  command?: string,
): Promise<[{ response: any; status: string }]>

/**
 * Set state for the plugin
 *
 */
export function setState<State>(state?: State): Promise<State>

/**
 * Returns the current state
 *
 */
export function getState(): Promise<any>

/**
 * Parse Redis response
 * Returns string with parsed cli-like response
 *
 */
export function formatRedisReply(
  response: any,
  command?: string,
): Promise<string>
