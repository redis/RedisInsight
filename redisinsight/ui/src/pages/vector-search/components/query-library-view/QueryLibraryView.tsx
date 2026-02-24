import React, { useCallback, useState } from 'react'

import { SearchInput } from 'uiSrc/components/base/inputs'
import { LoadingContent } from 'uiSrc/components/base/layout'
import { Text } from 'uiSrc/components/base/text'
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
      if (item) onRun(item.query)
    },
    [getItemById, onRun],
  )

  const handleLoad = useCallback(
    (id: string) => {
      const item = getItemById(id)
      if (item) onLoad(item.query)
    },
    [getItemById, onLoad],
  )

  const handleDeleteRequest = useCallback((id: string) => {
    setDeletingId(id)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingId) return
    await deleteItem(deletingId)
    setDeletingId(null)
  }, [deletingId, deleteItem])

  const handleDeleteCancel = useCallback(() => {
    setDeletingId(null)
  }, [])

  const isInitialLoading = loading === true && items.length === 0
  const isEmpty = loading === false && !error && items.length === 0

  return (
    <S.Container data-testid="query-library-view">
      <S.SearchBar>
        <SearchInput
          placeholder="Search query"
          value={search}
          onChange={onSearchChange}
          data-testid="query-library-search"
        />
      </S.SearchBar>

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
                : 'No queries in the library yet'}
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
