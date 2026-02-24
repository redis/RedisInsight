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
    async (id: string) => {
      if (!databaseId) return

      try {
        await serviceRef.current.delete(databaseId, id)
        setItems((prev) => prev.filter((item) => item.id !== id))
        setOpenItemId((prev) => (prev === id ? null : prev))
        dispatch(
          addMessageNotification(queryLibraryNotifications.queryDeleted()),
        )
      } catch {
        // Error notification is already dispatched by QueryLibraryService
      }
    },
    [databaseId, dispatch],
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
