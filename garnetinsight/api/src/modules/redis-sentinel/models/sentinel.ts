export interface ISentinelConnectionOptions {
  name: string;
  sentinels: Array<{ host: string; port: number }>;
  sentinelUsername?: string;
  sentinelPassword?: string;
}
