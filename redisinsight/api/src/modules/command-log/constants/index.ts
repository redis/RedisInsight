/**
 * Socket.io events used by the command log channel.
 *
 * Deliberately separate from the profiler events: the profiler namespace
 * starts a real `MONITOR` connection on Redis, while this channel only carries
 * commands this application itself sent.
 */
export enum CommandLogClientEvents {
  /** Join the room of the instance passed as `?instanceId=` on the socket. */
  Subscribe = 'commandLog',
  /** Leave the room (panel closed / paused). */
  Unsubscribe = 'commandLogStop',
}

export enum CommandLogServerEvents {
  /** Batch of `CommandLogEntry` items. */
  Data = 'commandLogData',
  /** Something went wrong while subscribing. */
  Exception = 'exception',
}

/** Socket.io namespace of the command log channel. */
export const COMMAND_LOG_NAMESPACE = 'commandLog';
