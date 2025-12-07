import { EventEmitter } from 'events';
import * as IORedis from 'ioredis';

export interface IShardObserver extends EventEmitter {
  disconnect(): void;
  options?: IORedis.RedisOptions;
}
