export interface PropertySort {
  field: string
  direction: 'asc' | 'desc'
}

export const DEFAULT_SORT: PropertySort = {
  field: 'lastConnection',
  direction: 'asc',
}
