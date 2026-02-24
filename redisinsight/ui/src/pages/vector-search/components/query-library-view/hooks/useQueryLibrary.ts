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
  const abortRef = useRef<AbortController | null>(null)

  const fetchItems = useCallback(
    async (searchTerm?: string) => {
      if (!databaseId || !indexName) return

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError(null)

      try {
        const data = await serviceRef.current.getList(databaseId, {
          indexName,
          search: searchTerm || undefined,
        })
        if (controller.signal.aborted) return
        setItems(data)
      } catch {
        if (controller.signal.aborted) return
        setItems([])
        setError('Failed to load query library')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
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
      abortRef.current?.abort()
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
        if (openItemId === id) {
          setOpenItemId(null)
        }
        dispatch(
          addMessageNotification(queryLibraryNotifications.queryDeleted()),
        )
      } catch {
        // Error notification is already dispatched by QueryLibraryService
      }
    },
    [databaseId, openItemId, dispatch],
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
    refreshList: fetchItems,
  }
}
