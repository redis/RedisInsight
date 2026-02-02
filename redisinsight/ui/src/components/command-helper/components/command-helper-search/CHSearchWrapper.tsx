import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  clearSearchingCommand,
  setSearchingCommand,
  setSearchingCommandFilter,
  setCliEnteringCommand,
} from 'uiSrc/slices/cli/cli-settings'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'

import CHSearchInput from './CHSearchInput'
import CHSearchFilter from './CHSearchFilter'

import * as S from '../../CommandHelper.styles'

const CHSearchWrapper = () => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { loading } = useSelector(appRedisCommandsSelector)
  const [filterType, setFilterType] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>('')
  const dispatch = useDispatch()

  const onChangeSearch = (value: string) => {
    setSearchValue(value)

    if (value === '' && !filterType) {
      dispatch(clearSearchingCommand())
      dispatch(setCliEnteringCommand())
      return
    }
    dispatch(setSearchingCommand(value))
  }

  const onChangeFilter = (type: string) => {
    setFilterType(type)

    if (type) {
      sendEventTelemetry({
        event: TelemetryEvent.COMMAND_HELPER_COMMAND_FILTERED,
        eventData: {
          databaseId: instanceId,
          group: type,
        },
      })
    }

    if (searchValue === '' && !type) {
      dispatch(clearSearchingCommand())
      dispatch(setCliEnteringCommand())
      return
    }
    dispatch(setSearchingCommandFilter(type))
  }

  return (
    <S.SearchWrapper>
      <CHSearchFilter isLoading={loading} submitFilter={onChangeFilter} />
      <CHSearchInput isLoading={loading} submitSearch={onChangeSearch} />
    </S.SearchWrapper>
  )
}

export default CHSearchWrapper
