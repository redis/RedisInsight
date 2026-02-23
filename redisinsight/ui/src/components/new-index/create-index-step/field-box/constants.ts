import { BadgeVariants } from 'uiSrc/components/base/display/badge/RiBadge'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

export const FIELD_TYPE_BADGE_VARIANT_MAP: Record<FieldTypes, BadgeVariants> = {
  [FieldTypes.TAG]: 'notice',
  [FieldTypes.TEXT]: 'informative',
  [FieldTypes.NUMERIC]: 'attention',
  [FieldTypes.VECTOR]: 'success',
  [FieldTypes.GEO]: 'default',
  [FieldTypes.GEOSHAPE]: 'default',
}
