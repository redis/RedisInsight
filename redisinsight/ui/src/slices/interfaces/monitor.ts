import { Socket } from 'socket.io-client'
import { Nullable } from 'uiSrc/utils'

export interface IMonitorData {
  time: string
  args: string[]
  source: string
  database: number
  shardOptions: { host?: string; port?: number; [key: string]: unknown }
}

export interface IMonitorDataPayload extends Partial<IMonitorData> {
  isError?: boolean
  message?: string
}

export interface StateMonitor {
  loading: boolean
  loadingPause: boolean
  isShowMonitor: boolean
  isMinimizedMonitor: boolean
  isRunning: boolean
  isStarted: boolean
  isPaused: boolean
  isResumeLocked: boolean
  isSaveToFile: boolean
  socket: Nullable<Socket>
  items: IMonitorDataPayload[]
  error: string
  logFileId: Nullable<string>
  timestamp: {
    start: number
    paused: number
    unPaused: number
    duration: number
  }
}
