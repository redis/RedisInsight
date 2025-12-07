import * as IORedis from 'ioredis';

export interface IMonitorData {
  time: string;
  args: string[];
  source: string;
  database: number;
  shardOptions: IORedis.RedisOptions;
}
