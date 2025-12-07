import { find, identity, pickBy } from 'lodash'
import {
  InstanceRedisCloud,
  InstanceRedisCluster,
} from 'uiSrc/slices/interfaces'

export const parseInstanceOptionsCluster = (
  uid: number,
  instances: InstanceRedisCluster[],
) => {
  const { options } =
    find(instances, (instance: InstanceRedisCluster) => instance.uid === uid) ||
    {}
  return pickBy(options, identity)
}

export const parseInstanceOptionsCloud = (
  databaseId: number,
  instances: InstanceRedisCloud[],
) => {
  const { options } =
    find(
      instances,
      (instance: InstanceRedisCloud) => instance.databaseId === databaseId,
    ) || {}
  return pickBy(options, identity)
}
