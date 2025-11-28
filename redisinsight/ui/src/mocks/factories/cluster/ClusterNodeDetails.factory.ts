import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { ClusterNodeDetails } from 'src/modules/cluster-monitor/models'

enum NodeRole {
  Primary = 'primary',
  Replica = 'replica',
}

enum HealthStatus {
  Online = 'online',
  Offline = 'offline',
  Loading = 'loading',
}

export const ClusterNodeDetailsFactory = Factory.define<ClusterNodeDetails>(
  () => ({
    id: faker.string.uuid(),
    version: faker.system.semver(),
    mode: faker.helpers.arrayElement(['standalone', 'cluster', 'sentinel']),
    host: faker.internet.ip(),
    port: faker.internet.port(),
    role: faker.helpers.arrayElement([NodeRole.Primary, NodeRole.Replica]),
    health: faker.helpers.arrayElement([
      HealthStatus.Online,
      HealthStatus.Offline,
      HealthStatus.Loading,
    ]),
    slots: ['0-5460'],
    totalKeys: faker.number.int({ min: 0, max: 1000000 }),
    usedMemory: faker.number.int({ min: 1000000, max: 100000000 }),
    opsPerSecond: faker.number.int({ min: 0, max: 10000 }),
    connectionsReceived: faker.number.int({ min: 0, max: 10000 }),
    connectedClients: faker.number.int({ min: 0, max: 100 }),
    commandsProcessed: faker.number.int({ min: 0, max: 1000000000 }),
    networkInKbps: faker.number.float({
      min: 0,
      max: 10000,
      fractionDigits: 2,
    }),
    networkOutKbps: faker.number.float({
      min: 0,
      max: 10000,
      fractionDigits: 2,
    }),
    cacheHitRatio: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
    replicationOffset: faker.number.int({ min: 0, max: 1000000 }),
    uptimeSec: faker.number.int({ min: 0, max: 10000000 }),
    replicas: [],
  }),
)
