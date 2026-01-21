/**
 * Events emitted by RedisClientStorage for client lifecycle management.
 * These events allow other modules to react to client creation/removal
 * without creating direct dependencies.
 */
export enum RedisClientEvents {
  /**
   * Emitted when a Redis client is stored in the client storage.
   * Listeners can use this to set up client-specific behavior
   * (e.g., token refresh for Azure Entra ID).
   */
  ClientStored = 'redis.client.stored',

  /**
   * Emitted when a Redis client is removed from the client storage.
   * Listeners can use this to clean up client-specific resources.
   */
  ClientRemoved = 'redis.client.removed',
}

/**
 * Payload for Redis client lifecycle events.
 */
export interface RedisClientLifecycleEvent {
  /**
   * Unique identifier for the client instance
   */
  clientId: string;

  /**
   * Database ID this client is connected to
   */
  databaseId: string;
}
