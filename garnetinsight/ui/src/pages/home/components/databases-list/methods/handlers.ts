import { Instance } from 'uiSrc/slices/interfaces'
import {
  getRedisInfoSummary,
  getRedisModulesSummary,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import {
  checkConnectToInstanceAction,
  setConnectedInstanceId,
} from 'uiSrc/slices/instances/instances'
import { appContextSelector, resetRdiContext } from 'uiSrc/slices/app/context'
import { BrowserStorageItem, Pages } from 'uiSrc/constants'
import { store, dispatch } from 'uiSrc/slices/store'
import {
  SortingState,
  PaginationState,
} from 'uiSrc/components/base/layout/table'
import { navigate } from 'uiSrc/Router'
import { TableStorageKey } from 'uiSrc/constants/storage'
import {
  getObjectStorageField,
  localStorageService,
  setObjectStorageField,
} from 'uiSrc/services'

const connectToInstance = (id: string) => {
  dispatch(resetRdiContext())
  dispatch(setConnectedInstanceId(id))

  navigate(Pages.browser(id))
}

export const handleCheckConnectToInstance = async (instance: Instance) => {
  const { id, provider, modules } = instance
  const { contextInstanceId } = appContextSelector(store.getState())

  dispatch(
    checkConnectToInstanceAction(
      id,
      connectToInstance,
      undefined,
      contextInstanceId !== id,
    ),
  )

  const modulesSummary = getRedisModulesSummary(modules)
  const infoData = await getRedisInfoSummary(id)

  sendEventTelemetry({
    event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
    eventData: {
      databaseId: id,
      provider,
      source: 'db_list',
      ...modulesSummary,
      ...infoData,
    },
  })
}

export const handleSortingChange = (sorting: SortingState) => {
  if (!sorting.length) {
    return
  }

  const sort = {
    field: sorting[0].id,
    direction: sorting[0].desc ? 'desc' : 'asc',
  }
  localStorageService.set(BrowserStorageItem.instancesSorting, sort)
  sendEventTelemetry({
    event: TelemetryEvent.CONFIG_DATABASES_DATABASE_LIST_SORTED,
    eventData: sort,
  })
}

export const handlePaginationChange = (paginationState: PaginationState) =>
  setObjectStorageField(
    BrowserStorageItem.tablePaginationState,
    TableStorageKey.dbList,
    paginationState,
  )

export const getDefaultPagination = () =>
  getObjectStorageField(
    BrowserStorageItem.tablePaginationState,
    TableStorageKey.dbList,
  )
