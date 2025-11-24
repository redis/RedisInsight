import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { map, pick } from 'lodash'
import { useHistory } from 'react-router-dom'

import { LoadedSentinel, ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import {
  createMastersSentinelAction,
  resetDataSentinel,
  resetLoadedSentinel,
  sentinelSelector,
  updateMastersSentinel,
} from 'uiSrc/slices/instances/sentinel'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { RowSelectionState } from 'uiSrc/components/base/layout/table'
import { CreateSentinelDatabaseDto } from 'apiSrc/modules/redis-sentinel/dto/create.sentinel.database.dto'
import { sentinelDatabasesColumnsConfig } from 'uiSrc/pages/autodiscover-sentinel/config/SentinelDatabasesColumns.config'

const updateSelection = (
  selected: ModifiedSentinelMaster[],
  masters: ModifiedSentinelMaster[],
) => {
  return selected.map(
    (select) =>
      masters.find((master) => getRowId(master) === getRowId(select)) ?? select,
  )
}

const sendCancelEvent = () => {
  sendEventTelemetry({
    event:
      TelemetryEvent.CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_CANCELLED,
  })
}

export const getRowId = (row: ModifiedSentinelMaster) => row.id || ''

export const useSentinelDatabasesConfig = () => {
  const [items, setItems] = useState<ModifiedSentinelMaster[]>([])

  const { data: masters } = useSelector(sentinelSelector)

  const [selection, setSelection] = useState<ModifiedSentinelMaster[]>([])
  const dispatch = useDispatch()
  const history = useHistory()
  useEffect(() => {
    if (masters.length) {
      setItems(masters)
      setSelection((prevState) => updateSelection(prevState, masters))
    }
  }, [masters.length])

  useEffect(() => setTitle('Auto-Discover Redis Sentinel Primary Groups'), [])
  const handleClose = useCallback(() => {
    sendCancelEvent()
    dispatch(resetDataSentinel())
    history.push(Pages.home)
  }, [dispatch, history])

  const handleBackAdding = useCallback(() => {
    sendCancelEvent()
    dispatch(resetLoadedSentinel(LoadedSentinel.Masters))
    history.push(Pages.home)
  }, [dispatch, history])

  const handleSelectionChange = useCallback(
    (currentSelected: RowSelectionState) => {
      const newSelection = items.filter((item) => {
        const id = getRowId(item)
        if (!id) {
          return false
        }
        return currentSelected[id]
      })
      setSelection(newSelection)
    },
    [items],
  )

  const handleAddInstances = useCallback(
    (databases: ModifiedSentinelMaster[]) => {
      const pikedDatabases = map(databases, (i) => {
        const database: CreateSentinelDatabaseDto = {
          name: i.name,
          alias: i.alias || i.name,
        }
        if (i.username) {
          database.username = i.username
        }
        if (i.password) {
          database.password = i.password
        }
        if (i.db) {
          database.db = i.db
        }
        return pick(database, 'alias', 'name', 'username', 'password', 'db')
      })

      dispatch(updateMastersSentinel(databases))
      dispatch(
        createMastersSentinelAction(pikedDatabases, () =>
          history.push(Pages.sentinelDatabasesResult),
        ),
      )
    },
    [dispatch, history],
  )

  const handleChangedInput = useCallback(
    (name: string, value: string) => {
      const [field, id] = name.split('-')

      setItems((items) =>
        items.map((item) => {
          const itemId = getRowId(item)
          if (itemId !== id) {
            return item
          }

          return { ...item, [field]: value }
        }),
      )
    },
    [setItems],
  )

  const shouldRenderSelection = items.length > 0
  const columns = useMemo(() => {
    const cols = sentinelDatabasesColumnsConfig(handleChangedInput)
    return shouldRenderSelection ? cols : cols.slice(1)
  }, [handleChangedInput, shouldRenderSelection])

  return {
    columns,
    selection,
    items,
    handleClose,
    handleBackAdding,
    handleAddInstances,
    handleSelectionChange,
  }
}
