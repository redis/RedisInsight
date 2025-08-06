import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { RiSearchInput } from 'uiBase/inputs'
import {
  instancesSelector,
  loadInstancesSuccess,
} from 'uiSrc/slices/instances/instances'
import { CONNECTION_TYPE_DISPLAY, Instance } from 'uiSrc/slices/interfaces'
import { tagsSelector } from 'uiSrc/slices/instances/tags'
import { lastConnectionFormat } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

export const instanceHasTags = (
  instance: Instance,
  selectedTags: Set<string>,
) =>
  selectedTags.size === 0 ||
  instance.tags?.some((tag) => selectedTags.has(`${tag.key}:${tag.value}`))

const SearchDatabasesList = () => {
  const [value, setValue] = useState('')
  const { data: instances } = useSelector(instancesSelector)
  const { selectedTags } = useSelector(tagsSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    const isInitialRender =
      value === '' &&
      selectedTags.size === 0 &&
      (!instances ||
        instances.length === 0 ||
        !instances.some((instance) => instance?.visible === false))

    if (isInitialRender) {
      return
    }

    const itemsTemp = instances.map((item: Instance) => ({
      ...item,
      visible:
        (instanceHasTags(item, selectedTags) &&
          (item.name?.toLowerCase().indexOf(value) !== -1 ||
            item.host?.toString()?.indexOf(value) !== -1 ||
            item.port?.toString()?.indexOf(value) !== -1 ||
            (item.connectionType &&
              CONNECTION_TYPE_DISPLAY[item.connectionType]
                ?.toLowerCase()
                ?.indexOf(value) !== -1) ||
            item.modules
              ?.map((m) => m.name?.toLowerCase())
              .join(',')
              .indexOf(value) !== -1 ||
            lastConnectionFormat(item.lastConnection)?.indexOf(value) !== -1 ||
            item.tags?.some(
              (tag) =>
                `${tag.key.toLowerCase()}:${tag.value.toLowerCase()}`.indexOf(
                  value,
                ) !== -1,
            ))) ||
        false, // force boolean type
    }))

    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_LIST_SEARCHED,
      eventData: {
        instancesFullCount: instances.length,
        instancesSearchedCount: itemsTemp.filter(({ visible }) => visible)
          ?.length,
      },
    })

    dispatch(loadInstancesSuccess(itemsTemp))
  }, [value, selectedTags])

  return (
    <RiSearchInput
      placeholder="Database List Search"
      onChange={(value) => setValue(value.toLowerCase())}
      value={value}
      aria-label="Search database list"
      data-testid="search-database-list"
    />
  )
}

export default SearchDatabasesList
