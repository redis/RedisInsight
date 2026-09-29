/**
 * Socket.io events of the command log channel.
 *
 * Mirrors `CommandLogClientEvents` / `CommandLogServerEvents` on the API side
 * (`api/src/modules/command-log/constants`). Keep both in sync.
 */
export enum CommandLogEvent {
  /** Ask the server to start streaming commands of this instance. */
  Subscribe = 'commandLog',
  /** Stop streaming (panel closed or paused). */
  Unsubscribe = 'commandLogStop',
  /** Server -> client: a batch of executed commands. */
  Data = 'commandLogData',
  /** Server -> client: subscription failed. */
  Exception = 'exception',
}
