import { mock } from 'ts-mockito'
import {
  parseInstanceOptionsCloud,
  parseInstanceOptionsCluster,
} from 'uiSrc/utils'
import {
  InstanceRedisCloud,
  InstanceRedisCluster,
} from 'uiSrc/slices/interfaces'

const instancesRedisClusterMock = [
  {
    ...mock<InstanceRedisCluster>(),
    uid: 1,
    options: {
      id: 1,
    },
  },
  {
    ...mock<InstanceRedisCluster>(),
    uid: 2,
  },
  {
    ...mock<InstanceRedisCluster>(),
    uid: 3,
  },
]

const instancesRedisCloudMock = [
  {
    ...mock<InstanceRedisCloud>(),
    databaseId: 1,
    options: {
      id: 1,
    },
  },
  {
    ...mock<InstanceRedisCloud>(),
    databaseId: 2,
  },
  {
    ...mock<InstanceRedisCloud>(),
    databaseId: 3,
  },
]

describe('parseInstanceOptionsCluster', () => {
  it('should parse', () => {
    expect(parseInstanceOptionsCluster(1, instancesRedisClusterMock)).toEqual({
      id: 1,
    })
  })
})

describe('parseInstanceOptionsCloud', () => {
  it('should parse', () => {
    expect(parseInstanceOptionsCloud(1, instancesRedisCloudMock)).toEqual({
      id: 1,
    })
  })
})
