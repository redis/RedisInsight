import {
  QueryLibraryItem,
  QueryLibraryType,
} from 'uiSrc/services/query-library/types'

export const buildLoadQuery = (item: QueryLibraryItem): string => {
  if (item.type === QueryLibraryType.Sample && item.description) {
    return `// ${item.description}\n${item.query}`
  }

  return item.query
}
