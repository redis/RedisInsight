export enum PubSubClientEvents {
  Subscribe = 'subscribe',
  Unsubscribe = 'unsubscribe',
}

export enum PubSubServerEvents {
  Exception = 'exception',
}

export enum SubscriptionType {
  Subscribe = 's',
  PSubscribe = 'p',
  SSubscribe = 'ss',
}

export enum RedisClientSubscriberStatus {
  Connecting = 'connecting',
  Connected = 'connected',
  Error = 'error',
  End = 'end',
}

export enum RedisClientSubscriberEvents {
  Connected = 'connected',
  ConnectionError = 'connection_error',
  Message = 'message',
  End = 'end',
}
