import { Nullable } from 'uiSrc/utils'
import { SlowLog, SlowLogConfig } from 'apiSrc/modules/slow-log/models'
import { ClusterDetails } from 'apiSrc/modules/cluster-monitor/models/cluster-details'
import {
  DatabaseAnalysis,
  ShortDatabaseAnalysis,
} from 'apiSrc/modules/database-analysis/models'

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
