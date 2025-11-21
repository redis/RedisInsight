import { redisCloudSubscriptionsColumns } from './RedisCloudSubscriptions.config'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

describe('RedisCloudSubscriptions.config', () => {
  it('should return all column definitions in correct order', () => {
    const columnIds = redisCloudSubscriptionsColumns.map((col) => col.id)

    expect(columnIds).toEqual([
      AutoDiscoverCloudIds.Selection,
      AutoDiscoverCloudIds.Alert,
      AutoDiscoverCloudIds.Id,
      AutoDiscoverCloudIds.Name,
      AutoDiscoverCloudIds.Type,
      AutoDiscoverCloudIds.Provider,
      AutoDiscoverCloudIds.Region,
      AutoDiscoverCloudIds.NumberOfDatabases,
      AutoDiscoverCloudIds.Status,
    ])
  })
})
