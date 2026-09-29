/**
 * Shape of a single command log entry as pushed to the UI.
 *
 * Kept free of imports from the redis client layer so both the client classes
 * (producers) and the gateway (consumer) can depend on it without cycles.
 */

export type CommandLogSource =
  'sendCommand' | 'call' | 'sendPipeline' | 'sendMulti';

export interface CommandLogEntry {
  /** Unique id, used as React key in the panel. */
  id: string;
  /** Epoch milliseconds at which the command was sent. */
  time: number;
  /** Database (instance) id — the socket.io room the entry is routed to. */
  databaseId: string;
  /** Logical db index the command ran against. */
  db: number | null;
  /** Host of the shard that executed the command (cluster support). */
  host?: string;
  /** Port of the shard that executed the command (cluster support). */
  port?: number;
  /** Connection context the command belongs to (Browser, CLI, ...). */
  context?: string;
  /** Human readable name of the user action that triggered the command. */
  operation?: string;
  /** Which client method produced the entry. */
  source: CommandLogSource;
  /** Upper cased command name, e.g. `HSET`. */
  command: string;
  /** Serialised, truncated arguments. */
  args: string[];
  /** Full one line representation, e.g. `HSET user:1 name Alice`. */
  commandLine: string;
  /** True when the command line was shortened to fit the log. */
  truncated: boolean;
  /** 1-based position inside a pipeline; undefined for single commands. */
  index?: number;
}
