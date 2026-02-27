import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { IRedisCommand } from 'uiSrc/constants'
import { LoadingContent } from 'uiSrc/components/base/layout'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import {
  fetchRedisearchListAction,
  redisearchListSelector,
} from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { searchAndQuerySelector } from 'uiSrc/slices/search/searchAndQuery'
import { mergeRedisCommandsSpecs } from 'uiSrc/utils/transformers/redisCommands'
import SEARCH_COMMANDS_SPEC from 'uiSrc/pages/workbench/data/supported_commands.json'
import {
  QueryEditorContextProvider,
  LoadingContainer,
} from 'uiSrc/components/query'

import { decodeIndexNameFromUrl } from '../../utils'
import { EditorTab, QueryEditorWrapperProps } from './QueryEditor.types'
import { EditorLibraryToggle } from './EditorLibraryToggle'
import { VectorSearchEditor } from './VectorSearchEditor'
import { VectorSearchActions } from './VectorSearchActions'
import * as S from './QueryEditor.styles'

/**
 * Wrapper for the Vector Search Query Editor.
 * Fetches commands + indexes, provides QueryEditorContext,
 * and composes the toggle header, editor, and actions bar.
 */
export const QueryEditorWrapper = ({
  query,
  setQuery,
  onSubmit,
}: QueryEditorWrapperProps) => {
  const { indexName } = useParams<{ indexName?: string }>()
  const [activeTab, setActiveTab] = useState<EditorTab>(EditorTab.Editor)

  const dispatch = useDispatch()
  const { loading: isCommandsLoading, spec: COMMANDS_SPEC } = useSelector(
    appRedisCommandsSelector,
  )
  const { id: connectedInstanceId } = useSelector(connectedInstanceSelector)
  const { data: indexes = [] } = useSelector(redisearchListSelector)
  const { loading, processing } = useSelector(searchAndQuerySelector)

  const REDIS_COMMANDS = useMemo(
    () =>
      mergeRedisCommandsSpecs(
        COMMANDS_SPEC,
        SEARCH_COMMANDS_SPEC,
      ) as IRedisCommand[],
    [COMMANDS_SPEC, SEARCH_COMMANDS_SPEC],
  )

  useEffect(() => {
    if (!connectedInstanceId) return
    dispatch(fetchRedisearchListAction(undefined, undefined, false))
  }, [connectedInstanceId])

  if (isCommandsLoading) {
    return (
      <S.EditorWrapper>
        <LoadingContainer>
          <LoadingContent lines={2} className="fluid" />
        </LoadingContainer>
      </S.EditorWrapper>
    )
  }

  return (
    <QueryEditorContextProvider
      value={{
        query,
        setQuery,
        commands: REDIS_COMMANDS,
        indexes,
        activeIndexName: indexName
          ? decodeIndexNameFromUrl(indexName)
          : undefined,
        isLoading: loading || processing,
        onSubmit,
      }}
    >
      <S.EditorWrapper data-testid="vector-search-query-editor">
        <EditorLibraryToggle activeTab={activeTab} onChangeTab={setActiveTab} />
        {activeTab === EditorTab.Editor && (
          <>
            <VectorSearchEditor />
            <VectorSearchActions />
          </>
        )}
        {activeTab === EditorTab.Library && (
          <div data-testid="vector-search-library-placeholder">
            {/* Library view placeholder -- to be implemented */}
          </div>
        )}
      </S.EditorWrapper>
    </QueryEditorContextProvider>
  )
}
