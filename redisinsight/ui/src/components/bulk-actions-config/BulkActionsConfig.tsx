import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Socket } from 'socket.io-client'

import {
  bulkActionsDeleteSelector,
  bulkActionsSelector,
  disconnectBulkDeleteAction,
  setBulkActionConnected,
  setBulkDeleteLoading,
  setDeleteOverview,
  setDeleteOverviewStatus,
} from 'uiSrc/slices/browser/bulkActions'
import { deleteKeysByPattern } from 'uiSrc/slices/browser/keys'
import { getSocketApiUrl, Nullable, triggerDownloadFromUrl } from 'uiSrc/utils'
import { sessionStorageService } from 'uiSrc/services'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { isProcessingBulkAction } from 'uiSrc/pages/browser/components/bulk-actions/utils'
import {
  BrowserStorageItem,
  BulkActionsServerEvent,
  BulkActionsStatus,
  BulkActionsType,
  SocketEvent,
} from 'uiSrc/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { appCsrfSelector } from 'uiSrc/slices/app/csrf'
import { useIoConnection } from 'uiSrc/services/hooks/useIoConnection'
import { getBaseUrl } from 'uiSrc/services/apiService'

const BulkActionsConfig = () => {
  const { id: instanceId = '', db } = useSelector(connectedInstanceSelector)
  const { isConnected } = useSelector(bulkActionsSelector)
  const {
    isActionTriggered: isDeleteTriggered,
    generateReport,
    filter,
    search,
  } = useSelector(bulkActionsDeleteSelector)
  const { token } = useSelector(appCsrfSelector)
  const socketRef = useRef<Nullable<Socket>>(null)
  const connectIo = useIoConnection(getSocketApiUrl('bulk-actions'), {
    token,
    query: { instanceId },
  })

  const dispatch = useDispatch()

  useEffect(() => {
    if (!isDeleteTriggered || !instanceId || socketRef.current?.connected) {
      return
    }

    let retryTimer: NodeJS.Timer
    socketRef.current = connectIo()

    socketRef.current.on(SocketEvent.Connect, () => {
      clearTimeout(retryTimer)
      dispatch(setBulkActionConnected(true))
      emitBulkDelete(`${Date.now()}`)
    })

    // Catch connect error
    socketRef.current?.on(SocketEvent.ConnectionError, () => {})

    // Catch disconnect
    socketRef.current?.on(SocketEvent.Disconnect, () => {
      dispatch(setDeleteOverviewStatus(BulkActionsStatus.Disconnected))
      handleDisconnect()
    })
  }, [instanceId, isDeleteTriggered])

  useEffect(() => {
    if (!socketRef.current?.connected) {
      return
    }
    const id =
      sessionStorageService.get(BrowserStorageItem.bulkActionDeleteId) ?? ''
    if (!id) return

    if (!isDeleteTriggered) {
      abortBulkDelete(id)
      return
    }

    emitBulkDelete(id)
  }, [isDeleteTriggered])

  const emitBulkDelete = (id: string) => {
    dispatch(setBulkDeleteLoading(true))
    sessionStorageService.set(BrowserStorageItem.bulkActionDeleteId, id)

    // Register overview listener BEFORE emitting Create to avoid missing early events
    // Server may start sending Overview events immediately after receiving Create
    socketRef.current?.off(BulkActionsServerEvent.Overview)
    socketRef.current?.on(BulkActionsServerEvent.Overview, (payload: any) => {
      dispatch(setBulkDeleteLoading(isProcessingBulkAction(payload.status)))
      dispatch(setDeleteOverview(payload))

      if (payload.status === BulkActionsStatus.Failed) {
        dispatch(disconnectBulkDeleteAction())
      }

      // Remove deleted keys from local state when bulk delete completes
      // Use payload.filter values (what server actually used) to avoid race conditions
      // if user changed search/filter while delete was running
      if (payload.status === BulkActionsStatus.Completed) {
        const deletedCount = payload.summary?.succeed || 0
        const pattern = payload.filter?.match
        // Only do local filtering for specific patterns, not for '*' (all keys)
        if (pattern && pattern !== '*') {
          dispatch(
            deleteKeysByPattern({
              pattern,
              deletedCount,
              filterType: payload.filter?.type || null,
            }),
          )
        }
      }
    })

    socketRef.current?.emit(
      BulkActionsServerEvent.Create,
      {
        id,
        databaseId: instanceId,
        db: db || 0,
        type: BulkActionsType.Unlink,
        filter: {
          type: filter,
          match: search || '*',
        },
        generateReport,
      },
      onBulkDeleting,
    )
  }

  const abortBulkDelete = (id: string) => {
    dispatch(setBulkDeleteLoading(true))
    socketRef.current?.emit(
      BulkActionsServerEvent.Abort,
      { id: `${id}` },
      onBulkDeleteAborted,
    )
  }

  const onBulkDeleting = (data: any) => {
    if (data.status === BulkActionsServerEvent.Error) {
      dispatch(disconnectBulkDeleteAction())
      dispatch(addErrorNotification({ response: { data: data.error } }))
    }

    // Trigger download if report URL is provided
    if ('downloadUrl' in data && data.downloadUrl) {
      triggerDownloadFromUrl(`${getBaseUrl()}${data.downloadUrl}`)
    }
  }

  const onBulkDeleteAborted = (data: any) => {
    dispatch(setBulkDeleteLoading(false))
    sessionStorageService.set(BrowserStorageItem.bulkActionDeleteId, '')
    dispatch(setDeleteOverview(data))
    handleDisconnect()
  }

  useEffect(() => {
    if (!isConnected && socketRef.current?.connected) {
      handleDisconnect()
    }
  }, [isConnected])

  const handleDisconnect = () => {
    dispatch(disconnectBulkDeleteAction())
    socketRef.current?.removeAllListeners()
    socketRef.current?.disconnect()
  }

  return null
}

export default BulkActionsConfig
