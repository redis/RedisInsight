import {
  JsonIcon,
  ProbabilisticIcon,
  QuerySearchIcon,
  TimeSeriesIcon,
} from '@redis-ui/icons'
import { IconType } from 'uiSrc/components/base/forms/buttons'
import { VectorSimilarityIcon } from 'uiSrc/components/base/icons'

const GUIDE_ICONS: Record<string, IconType> = {
  search: QuerySearchIcon,
  json: JsonIcon,
  'probabilistic-data-structures': ProbabilisticIcon,
  'time-series': TimeSeriesIcon,
  'vector-similarity-search': VectorSimilarityIcon,
}

export default GUIDE_ICONS
