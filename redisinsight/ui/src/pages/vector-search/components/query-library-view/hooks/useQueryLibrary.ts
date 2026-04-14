import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash'

import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { QueryLibraryService } from 'uiSrc/services/query-library/QueryLibraryService'
import { QueryLibraryItem } from 'uiSrc/services/query-library/types'
import { queryLibraryNotifications } from 'uiSrc/pages/vector-search/constants'

const SEARCH_DEBOUNCE_MS = 300

export const useQueryLibrary = () => {
  const dispatch = useDispatch()
  const { instanceId: databaseId, indexName: rawIndexName } = useParams<{
    instanceId: string
    indexName?: string
  }>()

  const indexName = rawIndexName ? decodeURIComponent(rawIndexName) : ''

  const [items, setItems] = useState<QueryLibraryItem[]>([])
  // Whether the library contains any items at all, ignoring the active search filter.
  // Updated only on unfiltered fetches and deletions, so it stays stable
  // during debounced search transitions and avoids UI flicker.
  const [hasItemsBeforeSearch, setHasItems] = useState(false)
  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [openItemId, setOpenItemId] = useState<string | null>(null)

  const serviceRef = useRef(new QueryLibraryService())

  const fetchItems = useCallback(
    async (searchTerm?: string) => {
      if (!databaseId || !indexName) return

      setLoading(true)
      setError(null)

      try {
        const data = await serviceRef.current.getList(databaseId, {
          indexName,
          search: searchTerm || undefined,
        })
        setItems(data)
        if (!searchTerm) {
          setHasItems(data.length > 0)
        }
      } catch {
        setItems([])
        setError('Failed to load query library')
      } finally {
        setLoading(false)
      }
    },
    [databaseId, indexName],
  )

  const debouncedFetch = useMemo(
    () => debounce((term: string) => fetchItems(term), SEARCH_DEBOUNCE_MS),
    [fetchItems],
  )

  useEffect(
    () => () => {
      debouncedFetch.cancel()
    },
    [debouncedFetch],
  )

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      debouncedFetch(value)
    },
    [debouncedFetch],
  )

  const deleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      if (!databaseId) {
        return false
      }

      try {
        await serviceRef.current.delete(databaseId, id)
        setItems((prev) => {
          const remaining = prev.filter((item) => item.id !== id)
          if (remaining.length === 0 && !search) {
            setHasItems(false)
          }
          return remaining
        })
        setOpenItemId((prev) => (prev === id ? null : prev))
        dispatch(
          addMessageNotification(queryLibraryNotifications.queryDeleted()),
        )
        return true
      } catch {
        return false
      }
    },
    [databaseId, dispatch, search],
  )

  const toggleItemOpen = useCallback((id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id))
  }, [])

  const getItemById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items],
  )

  return {
    items,
    hasItemsBeforeSearch,
    loading,
    error,
    search,
    openItemId,
    onSearchChange: handleSearchChange,
    deleteItem,
    toggleItemOpen,
    getItemById,
  }
}
