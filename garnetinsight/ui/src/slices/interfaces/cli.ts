export enum CommandExecutionStatus {
  Success = 'success',
  Fail = 'fail',
}

export enum ClusterNodeRole {
  All = 'ALL',
  Master = 'MASTER',
  Slave = 'SLAVE',
}

export interface StateCliSettings {
  isMinimizedHelper: boolean
  isShowCli: boolean
  isShowHelper: boolean
  cliClientUuid: string
  loading: boolean
  errorClient: string
  matchedCommand: string
  searchedCommand: string
  isSearching: boolean
  isEnteringCommand: boolean
  searchingCommand: string
  searchingCommandFilter: string
  unsupportedCommands: string[]
  blockingCommands: string[]
}

export interface StateCliOutput {
  data: (string | JSX.Element)[]
  commandHistory: string[]
  loading: boolean
  error: string
  db: number
}
