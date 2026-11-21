import { Socket } from 'socket.io-client'
import { Nullable } from 'uiSrc/utils'

/**
 * A single Redis command executed by the API on behalf of the UI.
 * Mirrors `CommandLogEntry` on the API side
 * (`api/src/modules/command-log/models/command-log.entry.ts`).
 */
export interface ICommandLogEntry {
  id: string
  /** Epoch milliseconds. */
  time: number
  databaseId: string
  /** Logical db index the command ran against. */
  db: Nullable<number>
  host?: string
  port?: number
  context?: string
  /** Human readable name of the action that triggered the command. */
  operation?: string
  source: string
  /** Upper cased command name, e.g. `HSET`. */
  command: string
  args: string[]
  /** Full one line representation. */
  commandLine: string
  truncated: boolean
  /** 1-based position inside a pipeline. */
  index?: number
}

export interface StateCommandLog {
  /** Whether the panel should be streaming. */
  isEnabled: boolean
  isPaused: boolean
  isAutoScrollEnabled: boolean
  socket: Nullable<Socket>
  entries: ICommandLogEntry[]
  error: string
}
