import { SortOrder } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import {
  ConsumerDto,
  ConsumerGroupDto,
  GetStreamEntriesResponse,
  PendingEntryDto,
} from 'apiSrc/modules/browser/stream/dto'
import { RedisResponseBuffer } from './app'

type Range = {
  start: string
  end: string
}

export enum StreamViewType {
  Data = 'Data',
  Groups = 'Groups',
  Consumers = 'Consumers',
  Messages = 'Messages',
}

export interface StateStream {
  loading: boolean
  error: string
  sortOrder: SortOrder
  range: Range
  data: StateStreamData
  viewType: StreamViewType
  groups: StateConsumerGroups
}

export interface StateStreamData extends GetStreamEntriesResponse {
  lastRefreshTime: Nullable<number>
  keyNameString: string
}

export interface StateConsumerGroups {
  loading: boolean
  error: string
  data: ConsumerGroupDto[]
  selectedGroup: Nullable<StateSelectedGroup>
  lastRefreshTime: Nullable<number>
}

export interface StateSelectedGroup {
  name: RedisResponseBuffer
  nameString: string
  data: ConsumerDto[]
  selectedConsumer: Nullable<StateSelectedConsumer>
  lastRefreshTime: Nullable<number>
}

export interface StateSelectedConsumer {
  name: RedisResponseBuffer
  nameString: string
  pending: number
  idle: number
  data: PendingEntryDto[]
  lastRefreshTime: Nullable<number>
}
