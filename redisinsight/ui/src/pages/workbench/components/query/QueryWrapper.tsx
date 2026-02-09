import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { LoadingContent } from 'uiSrc/components/base/layout'
import { IRedisCommand } from 'uiSrc/constants'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import {
  fetchRedisearchListAction,
  redisearchListSelector,
} from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { mergeRedisCommandsSpecs } from 'uiSrc/utils/transformers/redisCommands'
import SEARCH_COMMANDS_SPEC from 'uiSrc/pages/workbench/data/supported_commands.json'
import { QueryEditorContextProvider } from 'uiSrc/components/query'

import Query from './Query'
import { Props } from './QueryWrapper.types'
import * as S from './QueryWrapper.styles'

const QueryWrapper = (props: Props) => {
  const {
    query = '',
    activeMode,
    resultsMode,
    setQuery = () => {},
    setQueryEl,
    onKeyDown,
    onSubmit = () => {},
    onQueryChangeMode,
    onChangeGroupMode,
    onClear,
    queryProps = {},
  } = props
  const { loading: isCommandsLoading } = useSelector(appRedisCommandsSelector)
  const { id: connectedInstanceId } = useSelector(connectedInstanceSelector)
  const { data: indexes = [] } = useSelector(redisearchListSelector)
  const { spec: COMMANDS_SPEC } = useSelector(appRedisCommandsSelector)

  const REDIS_COMMANDS = useMemo(
    () =>
      mergeRedisCommandsSpecs(
        COMMANDS_SPEC,
        SEARCH_COMMANDS_SPEC,
      ) as IRedisCommand[],
    [COMMANDS_SPEC, SEARCH_COMMANDS_SPEC],
  )

  const dispatch = useDispatch()

  useEffect(() => {
    if (!connectedInstanceId) return

    // fetch indexes
    dispatch(fetchRedisearchListAction(undefined, undefined, false))
  }, [connectedInstanceId])

  const Placeholder = (
    <S.ContainerPlaceholder>
      <div>
        <LoadingContent lines={2} className="fluid" />
      </div>
    </S.ContainerPlaceholder>
  )

  if (isCommandsLoading) {
    return Placeholder
  }

  return (
    <QueryEditorContextProvider
      value={{
        query,
        setQuery,
        commands: REDIS_COMMANDS,
        indexes,
        isLoading: false,
        onSubmit,
      }}
    >
      <Query
        activeMode={activeMode}
        resultsMode={resultsMode}
        setQueryEl={setQueryEl}
        onKeyDown={onKeyDown}
        onQueryChangeMode={onQueryChangeMode}
        onChangeGroupMode={onChangeGroupMode}
        onClear={onClear}
        {...queryProps}
      />
    </QueryEditorContextProvider>
  )
}

export default React.memo(QueryWrapper)
