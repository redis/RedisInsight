import { useEffect, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from 'uiSrc/slices/hooks'

import {
  redisearchListSelector,
  fetchRedisearchListAction,
} from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { bufferToString, isRedisearchAvailable } from 'uiSrc/utils'

export const useRedisearchListData = () => {
  const dispatch = useAppDispatch()
  const { loading, data, error } = useAppSelector(redisearchListSelector)
  const { modules, host: instanceHost } = useAppSelector(
    connectedInstanceSelector,
  )

  const stringData = useMemo(
    () => data.map((index) => bufferToString(index)),
    [data],
  )

  useEffect(() => {
    if (!instanceHost) {
      return
    }

    const moduleExists = isRedisearchAvailable(modules)
    if (moduleExists) {
      dispatch(fetchRedisearchListAction())
    }
  }, [dispatch, instanceHost, modules])

  return {
    loading,
    error,
    data,
    stringData,
  }
}
