import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { debounce } from 'lodash'
import { Socket } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'

import {
  concatMonitorItems,
  lockResume,
  monitorSelector,
  pauseMonitor,
  resetMonitorItems,
  setError,
  setLogFileId,
  setMonitorLoadingPause,
  setSocket,
  setStartTimestamp,
  stopMonitor,
} from 'uiSrc/slices/cli/monitor'
import { getSocketApiUrl, Nullable } from 'uiSrc/utils'
import {
  MonitorErrorMessages,
  MonitorEvent,
  SocketErrors,
  SocketEvent,
} from 'uiSrc/constants'
import { IMonitorDataPayload } from 'uiSrc/slices/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { appCsrfSelector } from 'uiSrc/slices/app/csrf'
import { useIoConnection } from 'uiSrc/services/hooks/useIoConnection'
import { IMonitorData } from 'apiSrc/modules/profiler/interfaces/monitor-data.interface'

import ApiStatusCode from '../../constants/apiStatusCode'

interface IProps {
  retryDelay?: number
}
const MonitorConfig = ({ retryDelay = 15000 }: IProps) => {
  const { id: instanceId = '' } = useSelector(connectedInstanceSelector)
  const {
    socket,
    isRunning,
    isPaused,
    isSaveToFile,
    isMinimizedMonitor,
    isShowMonitor,
  } = useSelector(monitorSelector)
  const { token } = useSelector(appCsrfSelector)

  const socketRef = useRef<Nullable<Socket>>(null)
  const connectIo = useIoConnection(getSocketApiUrl('monitor'), {
    token,
    query: { instanceId },
  })
  const logFileIdRef = useRef<string>()
  const timestampRef = useRef<number>()
  const retryTimerRef = useRef<NodeJS.Timer>()
  const payloadsRef = useRef<IMonitorDataPayload[]>([])

  const dispatch = useDispatch()

  const setNewItems = debounce(
    (items, onSuccess?) => {
      dispatch(concatMonitorItems(items))
      onSuccess?.()
    },
    50,
    {
      maxWait: 150,
    },
  )

  const getErrorMessage = (error: {
    type: string
    name: any
    message: any
  }): string => {
    if (error?.type === SocketErrors.TransportError) {
      return MonitorErrorMessages.LostConnection
    }
    return error?.name || error?.message
  }

  useEffect(() => {
    if (!isRunning || !instanceId || socket?.connected) {
      return
    }

    logFileIdRef.current = `_redis_${uuidv4()}`
    timestampRef.current = Date.now()

    // Create SocketIO connection to instance by instanceId
    socketRef.current = connectIo()

    dispatch(setSocket(socketRef.current))

    const handleDisconnect = () => {
      socketRef.current?.removeAllListeners()
      dispatch(pauseMonitor())
      dispatch(stopMonitor())
      dispatch(lockResume())
    }

    // Catch exceptions
    socketRef.current?.on(MonitorEvent.Exception, (payload) => {
      if (payload.status === ApiStatusCode.Forbidden) {
        handleDisconnect()
        dispatch(setError(MonitorErrorMessages.NoPerm))
        dispatch(resetMonitorItems())
        return
      }

      payloadsRef.current.push({
        isError: true,
        time: `${Date.now()}`,
        ...payload,
      })
      setNewItems(payloadsRef.current, () => {
        payloadsRef.current.length = 0
      })
      dispatch(pauseMonitor())
    })

    // Catch disconnect
    socketRef.current?.on(SocketEvent.Disconnect, () => {
      if (retryDelay) {
        retryTimerRef.current = setTimeout(handleDisconnect, retryDelay)
      } else {
        handleDisconnect()
      }
    })

    // Catch connect error
    socketRef.current?.on(SocketEvent.ConnectionError, (error) => {
      payloadsRef.current.push({
        isError: true,
        time: `${Date.now()}`,
        message: getErrorMessage(error),
      })
      setNewItems(payloadsRef.current, () => {
        payloadsRef.current.length = 0
      })
    })
  }, [instanceId, isRunning, isPaused])

  useEffect(() => {
    if (!isRunning) {
      return
    }

    socketRef.current?.removeAllListeners(SocketEvent.Connect)
    socketRef.current?.on(SocketEvent.Connect, () => {
      // Trigger Monitor event
      clearTimeout(retryTimerRef.current!)
      dispatch(setLogFileId(logFileIdRef.current))
      dispatch(setStartTimestamp(timestampRef.current))
      if (!isPaused) {
        subscribeMonitorEvents()
      }
    })
  }, [isRunning, isPaused])

  useEffect(() => {
    if (!isRunning || isPaused || !socketRef.current?.connected) {
      return
    }

    subscribeMonitorEvents()
  }, [isRunning, isPaused])

  useEffect(() => {
    if (!isRunning) return

    const pauseUnpause = async () => {
      !isPaused &&
        (await new Promise<void>((resolve) =>
          socket?.emit(MonitorEvent.Monitor, () => resolve()),
        ))
      isPaused &&
        (await new Promise<void>((resolve) =>
          socket?.emit(MonitorEvent.Pause, () => resolve()),
        ))
      dispatch(setMonitorLoadingPause(false))
    }
    dispatch(setMonitorLoadingPause(true))
    pauseUnpause().catch(console.error)
  }, [isPaused, isRunning])

  useEffect(() => {
    if (!isRunning) {
      socket?.emit(MonitorEvent.FlushLogs)
      socket?.removeAllListeners()
      socket?.disconnect()
    }
  }, [socket, isRunning, isShowMonitor, isMinimizedMonitor])

  const subscribeMonitorEvents = () => {
    socketRef.current?.removeAllListeners(MonitorEvent.MonitorData)
    socketRef.current?.emit(
      MonitorEvent.Monitor,
      { logFileId: isSaveToFile ? logFileIdRef.current : null },
      handleMonitorEvents,
    )
  }

  const handleMonitorEvents = () => {
    dispatch(setMonitorLoadingPause(false))
    socketRef.current?.on(
      MonitorEvent.MonitorData,
      (payload: IMonitorData[]) => {
        payloadsRef.current = payloadsRef.current.concat(payload)

        // set batch of payloads and then clear batch
        setNewItems(payloadsRef.current, () => {
          payloadsRef.current.length = 0
          // reset all timings after items were changed
          setNewItems.cancel()
        })
      },
    )
  }

  return null
}

export default MonitorConfig
