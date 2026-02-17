import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { IndexListRow } from '../../components/index-list/IndexList.types'
import {
  fetchAllIndexesInfo,
  transformIndexListRows,
} from './useIndexListData.utils'

export interface UseIndexListDataResult {
  data: IndexListRow[]
  loading: boolean
}

/**
 * Hook for fetching index information for multiple indexes.
 * Multi-index counterpart of useIndexInfo — fetches info for all
 * provided index names in parallel and returns IndexListRow[].
 */
export const useIndexListData = (
  indexNames: string[],
): UseIndexListDataResult => {
  const [data, setData] = useState<IndexListRow[]>([])
  const [loading, setLoading] = useState(false)

  const connectedInstance = useSelector(connectedInstanceSelector)
  const instanceId = connectedInstance?.id

  const indexNamesKey = JSON.stringify(indexNames)

  useEffect(() => {
    const names: string[] = JSON.parse(indexNamesKey)

    if (!instanceId || names.length === 0) {
      setData([])
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()

    setLoading(true)

    fetchAllIndexesInfo(instanceId, names, controller.signal).then(
      (results) => {
        if (controller.signal.aborted) return

        setData(transformIndexListRows(names, results))
        setLoading(false)
      },
    )

    return () => {
      controller.abort()
    }
  }, [instanceId, indexNamesKey])

  return { loading, data }
}
