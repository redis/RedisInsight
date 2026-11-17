import { ImportDatabaseResultType } from 'uiSrc/constants'
import { TableResultData } from './ResultsLog'

export const RESULTS_DATA_CONFIG: TableResultData[] = [
  {
    type: ImportDatabaseResultType.Success,
    title: 'home.importDatabase.resultsLog.title.success',
  },
  {
    type: ImportDatabaseResultType.Partial,
    title: 'home.importDatabase.resultsLog.title.partial',
  },
  {
    type: ImportDatabaseResultType.Fail,
    title: 'home.importDatabase.resultsLog.title.fail',
  },
]
