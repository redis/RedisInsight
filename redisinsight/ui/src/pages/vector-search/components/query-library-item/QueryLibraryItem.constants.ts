import {
  QueryLibraryItemType,
  QueryTypeBadgeConfig,
} from './QueryLibraryItem.types'

export const QUERY_TYPE_BADGE_MAP: Record<
  QueryLibraryItemType,
  QueryTypeBadgeConfig
> = {
  [QueryLibraryItemType.Sample]: {
    labelKey: 'vectorSearch.queryLibrary.badge.sample',
    variant: 'default',
  },
  [QueryLibraryItemType.Saved]: {
    labelKey: 'vectorSearch.queryLibrary.badge.saved',
    variant: 'white',
  },
}
