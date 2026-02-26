import {
  QueryLibraryItemType,
  QueryTypeBadgeConfig,
} from './QueryLibraryItem.types'

export const QUERY_TYPE_BADGE_MAP: Record<
  QueryLibraryItemType,
  QueryTypeBadgeConfig
> = {
  [QueryLibraryItemType.Sample]: {
    label: 'Sample query',
    variant: 'default',
  },
  [QueryLibraryItemType.Saved]: {
    label: 'Saved query',
    variant: 'white',
  },
}
