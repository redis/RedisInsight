import { ImportDatabaseResultType } from 'uiSrc/constants'
import { TableResultData } from './ResultsLog'

export const RESULTS_DATA_CONFIG: TableResultData[] = [
  {
    type: ImportDatabaseResultType.Success,
    title: 'Fully imported',
  },
  {
    type: ImportDatabaseResultType.Partial,
    title: 'Partially imported',
  },
  {
    type: ImportDatabaseResultType.Fail,
    title: 'Failed to import',
  },
]
