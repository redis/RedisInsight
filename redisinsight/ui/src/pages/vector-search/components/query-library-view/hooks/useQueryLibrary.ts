import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TFunction } from 'i18next'
import { useAppDispatch } from 'uiSrc/slices/hooks'
import { useParams } from 'react-router-dom'

import { useTranslation } from 'uiSrc/i18n'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { QueryLibraryService } from 'uiSrc/services/query-library/QueryLibraryService'
import {
  QueryLibraryItem,
  QueryLibraryType,
} from 'uiSrc/services/query-library/types'
import { queryLibraryNotifications } from 'uiSrc/pages/vector-search/constants'

// Sample items are seeded with i18n keys as their name/description (so they
// follow runtime language changes); resolve those keys here for display and
// search. User-saved items are returned untouched.
const translateSampleItem = (
  item: QueryLibraryItem,
  t: TFunction,
): QueryLibraryItem => {
  if (item.type !== QueryLibraryType.Sample) {
    return item
  }

  return {
    ...item,
    name: t(item.name as never),
    description: item.description
      ? t(item.description as never)
      : item.description,
  }
}

export const useQueryLibrary = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { instanceId: databaseId, indexName: rawIndexName } = useParams<{
    instanceId: string
    indexName?: string
  }>()

  const indexName = rawIndexName ? decodeURIComponent(rawIndexName) : ''

  const [allItems, setAllItems] = useState<QueryLibraryItem[]>([])
  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [openItemId, setOpenItemId] = useState<string | null>(null)

  const serviceRef = useRef(new QueryLibraryService())

  const fetchItems = useCallback(async () => {
    if (!databaseId || !indexName) return

    setLoading(true)
    setError(null)

    try {
      const data = await serviceRef.current.getList(databaseId, { indexName })
      setAllItems(data)
    } catch {
      setAllItems([])
      setError(t('vectorSearch.queryLibrary.error.load'))
    } finally {
      setLoading(false)
    }
  }, [databaseId, indexName, t])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Resolve sample-item keys to the active language; recomputed on language
  // change via the `t` dependency so displayed/seeded items stay in sync.
  const translatedItems = useMemo(
    () => allItems.map((item) => translateSampleItem(item, t)),
    [allItems, t],
  )

  // Search client-side over the translated text so matches reflect what the
  // user actually sees (the DB stores i18n keys for sample items).
  const items = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return translatedItems

    return translatedItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.query?.toLowerCase().includes(term),
    )
  }, [translatedItems, search])

  // Reflects whether the library has any items at all, independent of search.
  const hasItemsBeforeSearch = translatedItems.length > 0

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])

  const deleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      if (!databaseId) {
        return false
      }

      try {
        await serviceRef.current.delete(databaseId, id)
        setAllItems((prev) => prev.filter((item) => item.id !== id))
        setOpenItemId((prev) => (prev === id ? null : prev))
        dispatch(
          addMessageNotification(queryLibraryNotifications.queryDeleted()),
        )
        return true
      } catch {
        return false
      }
    },
    [databaseId, dispatch],
  )

  const toggleItemOpen = useCallback((id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id))
  }, [])

  const getItemById = useCallback(
    (id: string) => translatedItems.find((item) => item.id === id),
    [translatedItems],
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
