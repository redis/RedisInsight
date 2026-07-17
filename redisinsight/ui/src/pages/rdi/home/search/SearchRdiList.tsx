import React from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import { SearchInput } from 'uiSrc/components/base/inputs'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import {
  instancesSelector,
  loadInstancesSuccess,
} from 'uiSrc/slices/rdi/instances'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { lastConnectionFormat } from 'uiSrc/utils'
import { useTranslation } from 'uiSrc/i18n'

const SearchRdiList = () => {
  const { t } = useTranslation()
  const { data: instances } = useAppSelector(instancesSelector)

  const dispatch = useAppDispatch()

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()

    const visibleItems = instances.map((item: RdiInstance) => ({
      ...item,
      visible:
        item.name.toLowerCase().indexOf(value) !== -1 ||
        item.url?.toString()?.indexOf(value) !== -1 ||
        item.version?.toString()?.indexOf(value) !== -1 ||
        lastConnectionFormat(item.lastConnection)?.indexOf(value) !== -1,
    }))

    sendEventTelemetry({
      event: TelemetryEvent.RDI_INSTANCE_LIST_SEARCHED,
      eventData: {
        instancesFullCount: instances.length,
        instancesSearchedCount: visibleItems.filter(({ visible }) => visible)
          ?.length,
      },
    })

    dispatch(loadInstancesSuccess(visibleItems))
  }

  return (
    <SearchInput
      placeholder={t('rdi.home.search.placeholder')}
      onChange={onQueryChange}
      aria-label={t('rdi.home.search.ariaLabel')}
      data-testid="search-rdi-instance-list"
    />
  )
}

export default SearchRdiList
