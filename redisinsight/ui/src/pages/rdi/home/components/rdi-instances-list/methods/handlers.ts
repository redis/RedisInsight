import {
  SortingState,
  PaginationState,
} from 'uiSrc/components/base/layout/table'
import { BrowserStorageItem, Pages } from 'uiSrc/constants'
import {
  getObjectStorageField,
  localStorageService,
  setObjectStorageField,
} from 'uiSrc/services'
import { dispatch } from 'uiSrc/slices/store'
import { navigate } from 'uiSrc/Router'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { setAppContextConnectedRdiInstanceId } from 'uiSrc/slices/app/context'
import { checkConnectToRdiInstanceAction } from 'uiSrc/slices/rdi/instances'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { TableStorageKey } from 'uiSrc/constants/storage'

import { sortingStateToPropertySort } from './sortingAdapters'
import { handleCopy } from 'uiSrc/utils'

export const handleSortingChange = (sorting: SortingState) => {
  if (!sorting.length) return

  const sort = sortingStateToPropertySort(sorting)
  localStorageService.set(BrowserStorageItem.rdiInstancesSorting, sort)
  sendEventTelemetry({
    event: TelemetryEvent.RDI_INSTANCE_LIST_SORTED,
    eventData: sort,
  })
}

export const handleCheckConnectToRdiInstance = (instance: RdiInstance) => {
  const { id } = instance

  sendEventTelemetry({
    event: TelemetryEvent.OPEN_RDI_CLICKED,
    eventData: { rdiId: id },
  })

  dispatch(
    checkConnectToRdiInstanceAction(
      id,
      (rdiId: string) => navigate(Pages.rdiPipeline(rdiId)),
      () => dispatch(setAppContextConnectedRdiInstanceId('')),
    ),
  )
}

export const sendCopyUrlTelemetry = async (id?: string) => {
  return sendEventTelemetry({
    event: TelemetryEvent.RDI_INSTANCE_URL_COPIED,
    eventData: { id },
  })
}

export const handleCopyUrl = (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  url = '',
  id?: string,
) => {
  e.stopPropagation()
  handleCopy(url)
  sendCopyUrlTelemetry(id)
}

export const handlePaginationChange = (paginationState: PaginationState) =>
  setObjectStorageField(
    BrowserStorageItem.tablePaginationState,
    TableStorageKey.rdiList,
    paginationState,
  )

export const getDefaultPagination = () =>
  getObjectStorageField(
    BrowserStorageItem.tablePaginationState,
    TableStorageKey.rdiList,
  )
