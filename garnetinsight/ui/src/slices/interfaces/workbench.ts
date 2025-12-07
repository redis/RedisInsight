import { CommandExecution } from './api'

export interface StateWorkbenchSettings {
  wbClientUuid: string
  loading: boolean
  error: string
  errorClient: string
  unsupportedCommands: string[]
}

export interface StateWorkbenchResults {
  isLoaded: boolean
  loading: boolean
  processing: boolean
  clearing: boolean
  error: string
  items: CommandExecutionUI[]
  resultsMode: ResultsMode
  activeRunQueryMode: RunQueryMode
}

export enum EnablementAreaComponent {
  CodeButton = 'code-button',
  Group = 'group',
  InternalLink = 'internal-link',
}

export interface IEnablementAreaItem {
  id: string
  type: EnablementAreaComponent
  label: string
  summary?: string
  children?: IEnablementAreaItem[]
  args?: Record<string, any>
  _actions?: string[]
  _path?: string
  _key?: string
  _groupPath?: string
}

export interface StateWorkbenchEnablementArea {
  loading: boolean
  deleting?: boolean
  error: string
  items: IEnablementAreaItem[]
}
export interface StateWorkbenchCustomTutorials
  extends StateWorkbenchEnablementArea {
  bulkUpload: {
    pathsInProgress: string[]
  }
}

export interface CommandExecutionUI extends Partial<CommandExecution> {
  id?: string
  loading?: boolean
  isOpen?: boolean
  error?: string
  emptyCommand?: boolean
}

export enum RunQueryMode {
  Raw = 'RAW',
  ASCII = 'ASCII',
}

export enum ResultsMode {
  Silent = 'SILENT',
  Default = 'DEFAULT',
  GroupMode = 'GROUP_MODE',
}

export enum CommandExecutionType {
  Workbench = 'WORKBENCH',
  Search = 'SEARCH',
}

export interface ResultsSummary {
  total: number
  success: number
  fail: number
}

export interface ExecuteQueryParams {
  batchSize: number
  activeRunQueryMode: RunQueryMode
  resultsMode: ResultsMode
}
