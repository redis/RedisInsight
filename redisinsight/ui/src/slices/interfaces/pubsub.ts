import { SubscriptionType } from 'uiSrc/constants/pubSub'

export interface SubscriptionDto {
  channel: string
  type: SubscriptionType
}

export interface PubSubSubscription {
  channel: string
  type: string
}

export interface PubSubMessage {
  channel: string
  message: string
  time: number
}

export interface StatePubSub {
  loading: boolean
  publishing: boolean
  error: string
  subscriptions: SubscriptionDto[]
  isSubscribeTriggered: boolean
  isConnected: boolean
  isSubscribed: boolean
  messages: PubSubMessage[]
  count: number
}
