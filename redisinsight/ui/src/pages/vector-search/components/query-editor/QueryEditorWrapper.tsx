import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'

import { IRedisCommand } from 'uiSrc/constants'
import { LoadingContent } from 'uiSrc/components/base/layout'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import {
  fetchRedisearchListAction,
  redisearchListSelector,
} from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { searchAndQuerySelector } from 'uiSrc/slices/search/searchAndQuery'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { mergeRedisCommandsSpecs } from 'uiSrc/utils/transformers/redisCommands'
import SEARCH_COMMANDS_SPEC from 'uiSrc/pages/workbench/data/supported_commands.json'
import {
  QueryEditorContextProvider,
  LoadingContainer,
} from 'uiSrc/components/query'
import { QueryLibraryService } from 'uiSrc/services/query-library/QueryLibraryService'
import { queryLibraryNotifications } from 'uiSrc/pages/vector-search/constants'

import { decodeIndexNameFromUrl } from '../../utils'
import { EditorTab, QueryEditorWrapperProps } from './QueryEditor.types'
import { EditorLibraryToggle } from './EditorLibraryToggle'
import { VectorSearchEditor } from './VectorSearchEditor'
import { VectorSearchActions } from './VectorSearchActions'
import { QueryLibraryView } from '../query-library-view'
import { SaveQueryModal } from '../save-query-modal'
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
  const { instanceId, indexName } = useParams<{
    instanceId: string
    indexName?: string
  }>()
  const location = useLocation<{ activeTab?: EditorTab }>()
  const [activeTab, setActiveTab] = useState<EditorTab>(
    location.state?.activeTab ?? EditorTab.Editor,
  )
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleLibraryLoad = useCallback(
    (queryText: string) => {
      setQuery(queryText)
      setActiveTab(EditorTab.Editor)
    },
    [setQuery],
  )

  const handleSaveClick = useCallback(() => {
    setIsSaveModalOpen(true)
  }, [])

  const handleSaveClose = useCallback(() => {
    setIsSaveModalOpen(false)
  }, [])

  const decodedIndexName = indexName ? decodeURIComponent(indexName) : ''

  const dispatch = useDispatch()

  const handleSaveSubmit = useCallback(
    async (name: string) => {
      if (!instanceId || !decodedIndexName) return

      setIsSaving(true)
      try {
        const queryLibraryService = new QueryLibraryService()
        const result = await queryLibraryService.create(instanceId, {
          indexName: decodedIndexName,
          name,
          query,
        })

        if (result) {
          dispatch(
            addMessageNotification(
              queryLibraryNotifications.querySaved(() => {
                setActiveTab(EditorTab.Library)
              }),
            ),
          )
          setIsSaveModalOpen(false)
        }
      } catch {
        dispatch(addMessageNotification(queryLibraryNotifications.saveFailed()))
      } finally {
        setIsSaving(false)
      }
    },
    [instanceId, decodedIndexName, query, dispatch],
  )

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
            <VectorSearchActions onSaveClick={handleSaveClick} />
          </>
        )}
        {activeTab === EditorTab.Library && (
          <QueryLibraryView onRun={onSubmit} onLoad={handleLibraryLoad} />
        )}
      </S.EditorWrapper>

      <SaveQueryModal
        isOpen={isSaveModalOpen}
        isSaving={isSaving}
        onSave={handleSaveSubmit}
        onClose={handleSaveClose}
      />
    </QueryEditorContextProvider>
  )
}
