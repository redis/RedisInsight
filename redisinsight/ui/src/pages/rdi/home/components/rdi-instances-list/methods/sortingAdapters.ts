import type { PropertySort } from '@elastic/eui'
import type { SortingState } from 'uiSrc/components/base/layout/table'
import { BrowserStorageItem, DEFAULT_SORT } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'

// This is for backwards compatibility with the old sorting state format
export const sortingStateToPropertySort = (
  sorting: SortingState,
  fallback: PropertySort = DEFAULT_SORT,
): PropertySort => {
  if (!sorting.length) return fallback
  return {
    field: sorting[0].id as string,
    direction: sorting[0].desc ? 'desc' : 'asc',
  }
}

export const propertySortToSortingState = (
  sort: PropertySort = DEFAULT_SORT,
): SortingState => [
  {
    id: sort.field,
    desc: sort.direction === 'desc',
  },
]

export const getDefaultSorting = (): SortingState =>
  propertySortToSortingState(
    localStorageService.get(BrowserStorageItem.rdiInstancesSorting) ||
      undefined,
  )
