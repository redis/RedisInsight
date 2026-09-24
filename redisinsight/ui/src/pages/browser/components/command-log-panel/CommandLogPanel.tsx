import React, { useCallback, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash'
import { Socket } from 'socket.io-client'

import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  commandLogSelector,
  concatCommandLogEntries,
  resetCommandLogEntries,
  setCommandLogError,
  setCommandLogSocket,
  togglePauseCommandLog,
} from 'uiSrc/slices/browser/commandLog'
import { appCsrfSelector } from 'uiSrc/slices/app/csrf'
import { CommandLogEvent, SocketEvent } from 'uiSrc/constants'
import { getSocketApiUrl, Nullable } from 'uiSrc/utils'
import { useIoConnection } from 'uiSrc/services/hooks/useIoConnection'
import { ICommandLogEntry } from 'uiSrc/slices/interfaces'
import { useTranslation } from 'uiSrc/i18n'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import CommandLogList from './components/CommandLogList'
import * as S from './CommandLogPanel.styles'

/**
 * Panel showing every Redis command this application executed for the current
 * instance, in order, labelled with the action that triggered them.
 *
 * Data comes from the API command log channel (namespace `commandLog`), which
 * — unlike the profiler — reports only commands sent by RedisInsight itself
 * and does not require a `MONITOR` connection on Redis.
 */
const CommandLogPanel = () => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { t } = useTranslation()
  const { token } = useAppSelector(appCsrfSelector)
  const { isPaused, isAutoScrollEnabled, entries, error } =
    useAppSelector(commandLogSelector)

  const socketRef = useRef<Nullable<Socket>>(null)
  const bufferRef = useRef<ICommandLogEntry[]>([])

  const dispatch = useAppDispatch()

  const connectIo = useIoConnection(getSocketApiUrl('commandLog'), {
    token,
    query: { instanceId },
  })

  // Commands arrive in bursts (opening one hash can send a dozen commands),
  // so entries are buffered and flushed to the store in batches.
  const flushEntries = debounce(
    () => {
      dispatch(concatCommandLogEntries(bufferRef.current))
      bufferRef.current = []
    },
    50,
    { maxWait: 150 },
  )

  const subscribe = useCallback(() => {
    socketRef.current?.emit(CommandLogEvent.Subscribe)
  }, [])

  useEffect(() => {
    if (!instanceId) {
      return
    }

    const socket = connectIo()
    socketRef.current = socket
    dispatch(setCommandLogSocket(socket))

    const handleConnect = () => subscribe()

    socket.on(SocketEvent.Connect, handleConnect)
    socket.on(CommandLogEvent.Data, (payload: ICommandLogEntry[]) => {
      bufferRef.current = bufferRef.current.concat(payload ?? [])
      flushEntries()
    })
    socket.on(CommandLogEvent.Exception, (payload: { message?: string }) => {
      dispatch(
        setCommandLogError(
          payload?.message ?? t('browser.commandLog.error.load'),
        ),
      )
    })
    socket.on(SocketEvent.ConnectionError, () => {
      dispatch(setCommandLogError(t('browser.commandLog.error.connection')))
    })

    if (socket.connected) {
      subscribe()
    }

    return () => {
      flushEntries.cancel()
      socket.emit(CommandLogEvent.Unsubscribe)
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
      bufferRef.current = []
    }
  }, [instanceId, t])

  // Pausing unsubscribes instead of merely hiding entries: the point of the
  // pause button is to stop the traffic, not just the rendering.
  useEffect(() => {
    const socket = socketRef.current

    if (!socket?.connected) {
      return
    }

    if (isPaused) {
      socket.emit(CommandLogEvent.Unsubscribe)
    } else {
      subscribe()
    }
  }, [isPaused, subscribe])

  const handleTogglePause = () => {
    dispatch(togglePauseCommandLog())
  }

  const handleClear = () => {
    bufferRef.current = []
    dispatch(resetCommandLogEntries())
  }

  return (
    <S.Container data-testid="command-log-panel">
      <S.Header>
        <S.Title>{t('browser.commandLog.title')}</S.Title>
        <S.HeaderActions>
          <EmptyButton size="small" onClick={handleTogglePause}>
            {isPaused
              ? t('browser.commandLog.resume')
              : t('browser.commandLog.pause')}
          </EmptyButton>
          <EmptyButton
            size="small"
            onClick={handleClear}
            disabled={!entries.length}
          >
            {t('common.button.clear')}
          </EmptyButton>
        </S.HeaderActions>
      </S.Header>

      {entries.length === 0 ? (
        <S.Placeholder data-testid="command-log-placeholder">
          {error || t('browser.commandLog.placeholder')}
        </S.Placeholder>
      ) : (
        <CommandLogList
          entries={entries}
          isAutoScrollEnabled={isAutoScrollEnabled}
        />
      )}
    </S.Container>
  )
}

export default CommandLogPanel
