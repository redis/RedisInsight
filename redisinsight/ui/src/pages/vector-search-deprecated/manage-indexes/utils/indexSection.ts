import { CategoryValueListItem } from '@redis-ui/components/dist/Section/components/Header/components/CategoryValueList'
import { IndexInfoDto } from 'src/modules/browser/redisearch/dto'

export const parseIndexSummaryInfo = (
  indexInfo: IndexInfoDto,
): CategoryValueListItem[] => [
  {
    category: 'Records',
    value: indexInfo?.num_records?.toString() || '',
    key: 'num_records',
  },
  {
    category: 'Terms',
    value: indexInfo?.num_terms?.toString() || '',
    key: 'num_terms',
  },
  {
    category: 'Fields',
    value: indexInfo?.attributes?.length.toString() || '',
    key: 'num_fields',
  },
  // TODO: Date info not available in IndexInfoDto
  // {
  //   category: 'Date',
  //   value: '',
  //   key: 'date',
  // },
]
