import { IMessage } from 'apiSrc/modules/pub-sub/interfaces/message.interface'
import { SubscriptionDto } from 'apiSrc/modules/pub-sub/dto/subscription.dto'

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
  messages: IMessage[]
  count: number
}
