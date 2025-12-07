export const APPLICATION_NAME = 'Garnet Insight'

export const API_URL = 'http://localhost:5000'

export enum DbType {
  STANDALONE = 'STANDALONE',
  CLUSTER = 'CLUSTER',
  SENTINEL = 'SENTINEL',
}

export enum RedisDataType {
  String = 'string',
  Hash = 'hash',
  List = 'list',
  Set = 'set',
  ZSet = 'zset',
  Stream = 'stream',
  JSON = 'ReJSON-RL',
  Graph = 'graphdata',
  TS = 'TSDB-TYPE',
}

// https://www.iana.org/assignments/uri-schemes/prov/redis
// https://www.iana.org/assignments/uri-schemes/prov/rediss
export const REDIS_URI_SCHEMES = ['redis', 'rediss']
