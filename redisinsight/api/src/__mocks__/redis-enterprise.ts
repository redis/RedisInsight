import { RedisEnterpriseDatabase } from 'src/modules/redis-enterprise/dto/cluster.dto';
import { RedisEnterpriseDatabaseStatus } from 'src/modules/redis-enterprise/models/redis-enterprise-database';
import { AddRedisEnterpriseDatabasesDto } from 'src/modules/redis-enterprise/dto/redis-enterprise-cluster.dto';

export const mockRedisEnterpriseDatabaseDto: RedisEnterpriseDatabase = {
  uid: 1,
  address: '172.17.0.2',
  dnsName: 'redis-12000.clus.local',
  modules: [],
  tags: [],
  name: 'db',
  options: {},
  port: 12000,
  status: RedisEnterpriseDatabaseStatus.Active,
  tls: false,
  password: null,
};

export const mockAddRedisEnterpriseDatabasesDto = Object.assign(
  new AddRedisEnterpriseDatabasesDto(),
  {
    host: 'localhost',
    port: 9443,
    username: 'admin',
    password: 'password',
    uids: [1],
  },
);

export const mockRedisEnterpriseAnalytics = jest.fn(() => ({
  sendGetRedisSoftwareDbsSucceedEvent: jest.fn(),
  sendGetRedisSoftwareDbsFailedEvent: jest.fn(),
}));

export const mockRedisEnterpriseService = jest.fn(() => ({
  addRedisEnterpriseDatabases: jest.fn().mockResolvedValue([]),
}));
