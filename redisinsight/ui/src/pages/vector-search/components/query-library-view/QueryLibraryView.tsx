import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

import { SearchInput } from 'uiSrc/components/base/inputs'
import { LoadingContent } from 'uiSrc/components/base/layout'
import { Text } from 'uiSrc/components/base/text'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { QueryLibraryType } from 'uiSrc/services/query-library/types'

import { QueryLibraryItem, QueryLibraryItemType } from '../query-library-item'
import { DeleteQueryModal } from './components/delete-query-modal'
import { useQueryLibrary } from './hooks/useQueryLibrary'
import { QueryLibraryViewProps } from './QueryLibraryView.types'
import * as S from './QueryLibraryView.styles'

const SERVICE_TYPE_TO_UI_TYPE: Record<QueryLibraryType, QueryLibraryItemType> =
  {
    [QueryLibraryType.Sample]: QueryLibraryItemType.Sample,
    [QueryLibraryType.Saved]: QueryLibraryItemType.Saved,
  }

export const QueryLibraryView = ({ onRun, onLoad }: QueryLibraryViewProps) => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const {
    items,
    loading,
    error,
    search,
    openItemId,
    onSearchChange,
    deleteItem,
    toggleItemOpen,
    getItemById,
  } = useQueryLibrary()

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleRun = useCallback(
    (id: string) => {
      const item = getItemById(id)
      if (item) {
        sendEventTelemetry({
          event: TelemetryEvent.SEARCH_QUERY_LIBRARY_RUN,
          eventData: {
            databaseId: instanceId,
            query_type: SERVICE_TYPE_TO_UI_TYPE[item.type],
          },
        })
        onRun(item.query)
      }
    },
    [getItemById, onRun, instanceId],
  )

  const handleLoad = useCallback(
    (id: string) => {
      const item = getItemById(id)
      if (item) {
        sendEventTelemetry({
          event: TelemetryEvent.SEARCH_QUERY_LIBRARY_LOADED,
          eventData: {
            databaseId: instanceId,
            query_type: SERVICE_TYPE_TO_UI_TYPE[item.type],
          },
        })
        onLoad(item.query)
      }
    },
    [getItemById, onLoad, instanceId],
  )

  const handleDeleteRequest = useCallback((id: string) => {
    setDeletingId(id)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingId) return
    const deleted = await deleteItem(deletingId)
    if (deleted) {
      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_QUERY_DELETED,
        eventData: { databaseId: instanceId },
      })
    }
    setDeletingId(null)
  }, [deletingId, deleteItem, instanceId])

  const handleDeleteCancel = useCallback(() => {
    setDeletingId(null)
  }, [])

  const isInitialLoading = loading === true && items.length === 0
  const isEmpty = loading === false && !error && items.length === 0
  const showSearchBar = items.length > 0 || !!search

  return (
    <S.Container data-testid="query-library-view">
      {showSearchBar && (
        <S.SearchBar>
          <SearchInput
            placeholder="Search query"
            value={search}
            onChange={onSearchChange}
            data-testid="query-library-search"
          />
        </S.SearchBar>
      )}

      <S.ListContainer>
        {isInitialLoading && (
          <S.LoadingWrapper data-testid="query-library-loading">
            <LoadingContent lines={3} className="fluid" />
          </S.LoadingWrapper>
        )}

        {error && (
          <S.EmptyState align="center" justify="center">
            <Text color="danger" data-testid="query-library-error">
              {error}
            </Text>
          </S.EmptyState>
        )}

        {isEmpty && (
          <S.EmptyState align="center" justify="center">
            <Text data-testid="query-library-empty">
              {search
                ? 'No queries match your search'
                : 'No saved queries yet. Create your query in editor and click Save to add it here.'}
            </Text>
          </S.EmptyState>
        )}

        {items.map((item) => (
          <QueryLibraryItem
            key={item.id}
            id={item.id}
            name={item.name}
            type={SERVICE_TYPE_TO_UI_TYPE[item.type]}
            query={item.query}
            description={item.description}
            isOpen={openItemId === item.id}
            onToggleOpen={toggleItemOpen}
            onRun={handleRun}
            onLoad={handleLoad}
            onDelete={handleDeleteRequest}
            dataTestId={`query-library-item-${item.id}`}
          />
        ))}
      </S.ListContainer>

      {deletingId && (
        <DeleteQueryModal
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </S.Container>
  )
}
