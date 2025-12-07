import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import { TelemetryEvent } from './events'

export interface ITelemetryIdentify {
  installationId: string
  sessionId: number
}

export type EventData = {
  [key: string]: any
  databaseId?: string
  provider?: string
}

export interface ITelemetrySendEvent {
  event: TelemetryEvent
  eventData?: EventData
  nonTracking?: boolean
  traits?: Object
}

export interface ITelemetrySendPageView {
  name: string
  eventData?: EventData
  nonTracking?: boolean
}

export interface ITelemetryEvent {
  event: TelemetryEvent
  properties?: object
}

export enum MatchType {
  EXACT_VALUE_NAME = 'EXACT_VALUE_NAME',
  PATTERN = 'PATTERN',
}

export enum RedisModules {
  RedisAI = 'ai',
  RedisGraph = 'graph',
  RedisGears = 'rg',
  RedisBloom = 'bf',
  RedisJSON = 'ReJSON',
  RediSearch = 'search',
  RedisTimeSeries = 'timeseries',
}

export interface IModuleSummary {
  loaded: boolean
  version?: number
  semanticVersion?: string
}

export type RedisModulesKeyType = keyof typeof RedisModules
export interface IRedisModulesSummary
  extends Record<keyof typeof RedisModules, IModuleSummary> {
  customModules: AdditionalRedisModule[]
}
