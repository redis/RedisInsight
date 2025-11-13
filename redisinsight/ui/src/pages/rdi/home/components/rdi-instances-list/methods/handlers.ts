import { SortingState } from 'uiSrc/components/base/layout/table'
import { BrowserStorageItem, Pages } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { dispatch } from 'uiSrc/slices/store'
import { navigate } from 'uiSrc/Router'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { setAppContextConnectedRdiInstanceId } from 'uiSrc/slices/app/context'
import { checkConnectToRdiInstanceAction } from 'uiSrc/slices/rdi/instances'
import { RdiInstance } from 'uiSrc/slices/interfaces'

import { sortingStateToPropertySort } from './sortingAdapters'

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

export const handleCopyUrl = (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  url = '',
  id?: string,
) => {
  e.stopPropagation()
  navigator.clipboard?.writeText(url)
  sendEventTelemetry({
    event: TelemetryEvent.RDI_INSTANCE_URL_COPIED,
    eventData: { id },
  })
}
