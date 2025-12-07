import { Socket } from 'socket.io-client'
import { Nullable } from 'uiSrc/utils'
import { IMonitorData } from 'apiSrc/modules/profiler/interfaces/monitor-data.interface'

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
