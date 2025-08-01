import { CommandExecutionUI, RunQueryMode, ResultsMode } from './workbench'

export interface StateVectorSearchQuery {
  isLoaded: boolean
  loading: boolean
  processing: boolean
  clearing: boolean
  error: string
  items: CommandExecutionUI[]
  resultsMode: ResultsMode
  activeRunQueryMode: RunQueryMode
}
