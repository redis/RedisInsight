export enum AppAnalyticsEvents {
  Initialize = 'analytics.initialize',
  Track = 'analytics.track',
  Page = 'analytics.page',
}

export enum AppRedisInstanceEvents {
  Deleted = 'instance.deleted',
}

export enum RedisClientEvents {
  ClientStored = 'redis.client.stored',
  ClientRemoved = 'redis.client.removed',
}
