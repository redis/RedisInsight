import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { ApiStatusCode, Pages } from 'uiSrc/constants'
import {
  createMastersSentinelAction,
  resetDataSentinel,
  resetLoadedSentinel,
  sentinelSelector,
  updateMastersSentinel,
} from 'uiSrc/slices/instances/sentinel'
import {
  AddRedisDatabaseStatus,
  LoadedSentinel,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'
import { removeEmpty, setTitle } from 'uiSrc/utils'
import { pick } from 'lodash'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { getColumns } from './components/utils/getColumns'

export const useSentinelDatabasesResultConfig = () => {
  const [items, setItems] = useState<ModifiedSentinelMaster[]>([])
  const [isInvalid, setIsInvalid] = useState(true)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleBackAdding = useCallback(() => {
    dispatch(resetLoadedSentinel(LoadedSentinel.MastersAdded))
    history.push(Pages.home)
  }, [])

  const handleViewDatabases = useCallback(() => {
    dispatch(resetDataSentinel())
    history.push(Pages.home)
  }, [])

  const { data: masters } = useSelector(sentinelSelector)
  const mastersLength = masters.length

  const countSuccessAdded = masters.filter(
    ({ status }) => status === AddRedisDatabaseStatus.Success,
  )?.length

  useEffect(() => {
    if (!mastersLength) {
      history.push(Pages.home)
      return
    }
    setTitle('Redis Sentinel Primary Groups Added')

    setIsInvalid(true)
    setItems(masters)
    dispatch(resetLoadedSentinel(LoadedSentinel.MastersAdded))
  }, [mastersLength])

  const handleAddInstance = useCallback(
    (masterName: string) => {
      const instance: ModifiedSentinelMaster = {
        ...removeEmpty(items.find((item) => item.name === masterName)),
        loading: true,
      }

      const updatedItems = items.map((item) =>
        item.name === masterName ? instance : item,
      )

      const pikedInstance = [
        pick(instance, 'alias', 'name', 'username', 'password', 'db'),
      ]

      dispatch(updateMastersSentinel(updatedItems))
      dispatch(createMastersSentinelAction(pikedInstance))
    },
    [items],
  )

  const handleChangedInput = useCallback(
    (name: string, value: string) => {
      const [field, id] = name.split('-')

      setItems((items) => {
        const item = items.find((item) => item.id === id)
        // @ts-ignore
        if (!item || item[field] === value) {
          return items
        }
        return items.map((item) => {
          if (item.id !== id) {
            return item
          }

          return { ...item, [field]: value }
        })
      })
    },
    [setItems],
  )

  const columns: ColumnDef<ModifiedSentinelMaster>[] = useMemo(() => {
    return getColumns(
      handleChangedInput,
      handleAddInstance,
      isInvalid,
      countSuccessAdded,
      items.length,
    )
  }, [
    countSuccessAdded,
    isInvalid,
    items.length,
    handleAddInstance,
    handleChangedInput,
  ])

  return {
    columns,
    items,
    countSuccessAdded,
    handleBackAdding,
    handleViewDatabases,
  }
}
