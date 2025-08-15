import { monaco as monacoEditor } from 'react-monaco-editor'
import { Nullable } from 'uiSrc/utils'
import { ICommand } from 'uiSrc/constants'
import { Rdi as RdiInstanceResponse } from 'apiSrc/modules/rdi/models/rdi'

// tabs for dry run job panel
export enum PipelineJobsTabs {
  Transformations = 'transformations',
  Output = 'output',
}

// pipeline management page tabs
export enum RdiPipelineTabs {
  Config = 'config',
  Jobs = 'jobs',
}

export interface IRdiPipelineJob {
  name: string
  value: string
}

export interface IPipeline {
  config: string
  jobs: IRdiPipelineJob[]
}

export interface IPipelineJSON {
  config: object
  jobs: { [key: string]: any }
}

interface IDryRunJobOutput {
  connection: string
  commands: string[]
}

export interface IDryRunJobResults {
  transformation: object
  output: IDryRunJobOutput[]
}

export interface IRdiPipelineStrategy {
  strategy: string
  databases: string[]
}

export interface IRdiPipelineStrategies {
  loading: boolean
  error: string
  data: IRdiPipelineStrategy[]
}

export enum StatisticsConnectionStatus {
  notYetUsed = 'not yet used',
  connected = 'connected',
}

export interface IConnections {
  [key: string]: {
    host: string
    port: number
    status: StatisticsConnectionStatus
    type: string
    database: string
    user: string
  }
}

export interface IDataStreamsData {
  total: number
  pending: number
  inserted: number
  updated: number
  deleted: number
  filtered: number
  rejected: number
  deduplicated: number
  lastArrival?: string
}

export interface IDataStreams {
  totals: IDataStreamsData
  streams: {
    [key: string]: IDataStreamsData
  }
}

export interface IProcessingPerformance {
  totalBatches: number
  batchSizeAvg: number
  readTimeAvg: number
  processTimeAvg: number
  ackTimeAvg: number
  totalTimeAvg: number
  recPerSecAvg: number
}

export interface IRdiPipelineStatus {
  rdiVersion: string
  address: string
  runStatus: string
  syncMode: string
}

export interface IClients {
  [key: string]: {
    addr: string
    name: string
    ageSec: number
    idleSec: number
    user: string
  }
}

export enum RdiPipelineStatus {
  Success = 'success',
  Failed = 'failed',
}

export interface IRdiStatistics {
  status: RdiPipelineStatus
  data: {
    connections: IConnections
    dataStreams: IDataStreams
    processingPerformance: IProcessingPerformance
    rdiPipelineStatus: IRdiPipelineStatus
    clients: IClients
  }
}

export enum FileChangeType {
  Added = 'added',
  Modified = 'modified',
  Removed = 'removed',
}

export enum PipelineStatus {
  Validating = 'validating',
  Starting = 'starting',
  Stopping = 'stopping',
  Resetting = 'resetting',
  Ready = 'ready',
  NotReady = 'not-ready',
  Stopped = 'stopped',
}

export enum PipelineState {
  InitialSync = 'initial-sync',
  CDC = 'cdc',
  NotRunning = 'not-running',
}

export enum CollectorStatus {
  Ready = 'ready',
  Stopped = 'stopped',
  NotReady = 'not-ready',
}

export interface IPipelineStatus {
  components: Record<string, unknown>
  pipelines: {
    default?: {
      status: PipelineStatus
      state: PipelineState
      tasks: unknown
    }
  }
}

export enum PipelineAction {
  Start = 'start',
  Stop = 'stop',
  Reset = 'reset',
}

export interface IStateRdiPipeline {
  loading: boolean
  error: string
  data: Nullable<IPipeline>
  config: string
  jobs: IRdiPipelineJob[]
  isPipelineValid: boolean
  configValidationErrors: string[]
  jobsValidationErrors: Record<string, string[]>
  resetChecked: boolean
  schema: Nullable<object>
  jobNameSchema: Nullable<object>
  monacoJobsSchema: Nullable<object>
  strategies: IRdiPipelineStrategies
  changes: Record<string, FileChangeType>
  jobFunctions: monacoEditor.languages.CompletionItem[]
  status: {
    loading: boolean
    error: string
    data: Nullable<IPipelineStatus>
  }
  pipelineAction: {
    loading: boolean
    error: string
    action: Nullable<PipelineAction>
  }
}

export interface IStateRdiDryRunJob {
  loading: boolean
  error: string
  results: Nullable<IDryRunJobResults>
}

export interface IStateRdiStatistics {
  loading: boolean
  error: string
  results: Nullable<IRdiStatistics>
}

export interface RdiInstance extends RdiInstanceResponse {
  visible?: boolean
  loading: boolean
  error: string
  // not really present, but used in InstancesList.tsx:142
  db?: number
}

export interface IErrorData {
  message: string
  statusCode: number
  error: string
  errorCode?: number
  errors?: string[]
}

export interface InitialStateRdiInstances {
  loading: boolean
  error: string
  data: RdiInstance[]
  connectedInstance: RdiInstance
  loadingChanging: boolean
  errorChanging: string
  changedSuccessfully: boolean
  isPipelineLoaded: boolean
}

// Rdi test target connections
export enum TestConnectionStatus {
  Fail = 'failed',
  Success = 'success',
}

interface IErrorDetail {
  code: string
  message: string
}

interface ITargetDetail {
  status: TestConnectionStatus
  error?: IErrorDetail
}

interface ISourcesDetail {
  connected: boolean
  error?: string
}

export interface IConnectionResult {
  targets: ITargets
  sources: ISourcesDetail
}

export interface ITargets {
  [key: string]: ITargetDetail
}

export interface TestConnectionsResponse {
  targets: ITargets
  sources: ISourcesDetail
}

export interface IRdiConnectionResult {
  target: string
  error?: string
}

export interface TransformGroupResult {
  success: IRdiConnectionResult[]
  fail: IRdiConnectionResult[]
}

export interface TransformResult {
  target: TransformGroupResult
  source: TransformGroupResult
}

export interface IStateRdiTestConnections {
  loading: boolean
  error: string
  results: Nullable<TransformResult>
}

export type TJMESPathFunctions = {
  [key: string]: Pick<ICommand, 'summary'> &
    Required<Pick<ICommand, 'arguments'>>
}

export interface IYamlFormatError {
  filename: string
  msg: string
}

export interface IActionPipelineResultProps {
  success: boolean
  error: Nullable<string>
}
