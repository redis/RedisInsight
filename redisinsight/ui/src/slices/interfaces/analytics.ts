import { Nullable } from 'uiSrc/utils'
import {
  SlowLog,
  SlowLogConfig,
  ClusterDetails,
  DatabaseAnalysis,
  ShortDatabaseAnalysis,
} from 'apiClient'

export interface StateSlowLog {
  loading: boolean
  error: string
  data: SlowLog[]
  lastRefreshTime: Nullable<number>
  config: Nullable<SlowLogConfig>
}

export interface StateClusterDetails {
  loading: boolean
  error: string
  data: Nullable<ClusterDetails>
}

export interface StateDatabaseAnalysis {
  loading: boolean
  error: string
  data: Nullable<DatabaseAnalysis>
  selectedViewTab: DatabaseAnalysisViewTab
  history: {
    loading: boolean
    error: string
    data: ShortDatabaseAnalysis[]
    selectedAnalysis: Nullable<string>
    showNoExpiryGroup: boolean
  }
}

export interface StateAnalyticsSettings {
  viewTab: AnalyticsViewTab
}

export enum AnalyticsViewTab {
  ClusterDetails = 'ClusterDetails',
  DatabaseAnalysis = 'DatabaseAnalysis',
  SlowLog = 'SlowLog',
}

export enum DatabaseAnalysisViewTab {
  DataSummary = 'DataSummary',
  Recommendations = 'Recommendations',
}
