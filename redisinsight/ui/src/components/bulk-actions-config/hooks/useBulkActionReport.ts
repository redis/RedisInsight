import { useState, useEffect, useCallback, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { BulkActionsClientEvent, BulkActionsServerEvent } from 'uiSrc/constants'

interface UseBulkActionReportProps {
  socket: Socket | null
  enableReporting: boolean
  search?: string
  filter?: string
}

interface ReportCompletionData {
  status: string
  summary?: {
    processed?: number
    succeed?: number
    failed?: number
  }
  totalKeysEmitted: number
}

export const useBulkActionReport = ({
  socket,
  enableReporting,
  search,
  filter,
}: UseBulkActionReportProps) => {
  const [bulkActionId, setBulkActionId] = useState<string | null>(null)
  const [reportKeys, setReportKeys] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const reportKeysRef = useRef<string[]>([])

  // Keep ref in sync with state
  useEffect(() => {
    reportKeysRef.current = reportKeys
  }, [reportKeys])

  const generateAndDownloadReport = useCallback(
    (
      actionId: string,
      keys: string[],
      completionData: ReportCompletionData,
    ) => {
      const lines = [
        'Bulk Delete Report',
        '==================',
        '',
        `Pattern: ${search || '*'}`,
        `Key type: ${filter || 'All'}`,
        `Status: ${completionData.status}`,
        `Processed: ${completionData.summary?.processed || 0} keys`,
        `Succeeded: ${completionData.summary?.succeed || keys.length} keys`,
        `Failed: ${completionData.summary?.failed || 0} keys`,
        '',
        'Deleted Keys:',
        '=============',
        '',
        ...keys,
      ]

      const reportContent = lines.join('\n')
      const blob = new Blob([reportContent], { type: 'text/plain' })
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `bulk-delete-report-${actionId}-${Date.now()}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(blobUrl)
    },
    [search, filter],
  )

  // Auto-setup listeners when socket/bulkActionId changes
  useEffect(() => {
    if (!socket?.connected || !bulkActionId) return

    const handleReportReady = (data: {
      bulkActionId: string
      status?: string
    }) => {
      // If the bulk action is already completed, don't try to start execution
      if (
        data.status === 'completed' ||
        data.status === 'failed' ||
        data.status === 'aborted'
      ) {
        return
      }

      socket.emit(BulkActionsServerEvent.StartExecution, {
        id: data.bulkActionId,
      })
    }

    const handleReportKeys = (data: {
      keys: string[]
      count: number
      totalEmitted: number
    }) => {
      setReportKeys((prev) => [...prev, ...data.keys])
    }

    const handleReportComplete = (data: ReportCompletionData) => {
      setIsComplete(true)

      if (enableReporting) {
        const currentKeys = reportKeysRef.current
        generateAndDownloadReport(bulkActionId, currentKeys, data)
      }
    }

    // Subscribe to report
    socket.emit(BulkActionsServerEvent.SubscribeReport, {
      id: bulkActionId,
    })

    // Set up listeners
    socket.on(BulkActionsClientEvent.ReportReady, handleReportReady)
    socket.on(BulkActionsClientEvent.ReportKeys, handleReportKeys)
    socket.on(BulkActionsClientEvent.ReportComplete, handleReportComplete)

    return () => {
      socket.off(BulkActionsClientEvent.ReportReady, handleReportReady)
      socket.off(BulkActionsClientEvent.ReportKeys, handleReportKeys)
      socket.off(BulkActionsClientEvent.ReportComplete, handleReportComplete)
    }
  }, [socket, bulkActionId, enableReporting, generateAndDownloadReport])

  const startReporting = useCallback((id: string) => {
    setReportKeys([])
    setIsComplete(false)
    reportKeysRef.current = []
    setBulkActionId(id)
  }, [])

  return {
    startReporting,
    reportKeys,
    isComplete,
    bulkActionId,
  }
}
