import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { LoadingContent } from 'uiSrc/components/base/layout'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import {
  fetchRedisearchListAction,
  redisearchListSelector,
} from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { mergeRedisCommandsSpecs } from 'uiSrc/utils/transformers/redisCommands'
import SEARCH_COMMANDS_SPEC from 'uiSrc/pages/workbench/data/supported_commands.json'
import styles from './Query/styles.module.scss'
import Query from './Query'
import { Props as BaseQueryProps } from './Query/Query'

type QueryProps = Pick<BaseQueryProps, 'useLiteActions'>

export interface Props {
  query: string
  activeMode: RunQueryMode
  resultsMode?: ResultsMode
  queryProps?: QueryProps
  setQuery: (script: string) => void
  setQueryEl: Function
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void
  onSubmit: (value?: string) => void
  onQueryChangeMode: () => void
  onChangeGroupMode: () => void
}

const QueryWrapper = (props: Props) => {
  const {
    query = '',
    activeMode,
    resultsMode,
    setQuery,
    setQueryEl,
    onKeyDown,
    onSubmit,
    onQueryChangeMode,
    onChangeGroupMode,
    queryProps = {},
  } = props
  const { loading: isCommandsLoading } = useSelector(appRedisCommandsSelector)
  const { id: connectedIndstanceId } = useSelector(connectedInstanceSelector)
  const { data: indexes = [] } = useSelector(redisearchListSelector)
  const { spec: COMMANDS_SPEC } = useSelector(appRedisCommandsSelector)

  const REDIS_COMMANDS = useMemo(
    () => mergeRedisCommandsSpecs(COMMANDS_SPEC, SEARCH_COMMANDS_SPEC),
    [COMMANDS_SPEC, SEARCH_COMMANDS_SPEC],
  )

  const dispatch = useDispatch()

  useEffect(() => {
    if (!connectedIndstanceId) return

    // fetch indexes
    dispatch(fetchRedisearchListAction(undefined, undefined, false))
  }, [connectedIndstanceId])

  const Placeholder = (
    <div className={styles.containerPlaceholder}>
      <div>
        <LoadingContent lines={2} className="fluid" />
      </div>
    </div>
  )
  return isCommandsLoading ? (
    Placeholder
  ) : (
    <Query
      query={query}
      commands={REDIS_COMMANDS}
      indexes={indexes}
      activeMode={activeMode}
      resultsMode={resultsMode}
      setQuery={setQuery}
      setQueryEl={setQueryEl}
      onKeyDown={onKeyDown}
      onSubmit={onSubmit}
      onQueryChangeMode={onQueryChangeMode}
      onChangeGroupMode={onChangeGroupMode}
      {...queryProps}
    />
  )
}

export default React.memo(QueryWrapper)
