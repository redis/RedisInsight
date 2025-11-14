import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'
import { colFactory } from './colFactory'

describe('colFactory', () => {
  it('should return columns without selection column when items array is empty', () => {
    const items: RedisCloudSubscription[] = []
    const columns = colFactory(items)

    expect(columns).toHaveLength(8)
    expect(columns[0].id).toBe('alert')
    expect(columns[1].id).toBe('id')
    expect(columns[2].id).toBe('name')
  })

  it('should return columns with selection column when items array has data', () => {
    const items: RedisCloudSubscription[] = [
      {
        id: 1,
        name: 'test-subscription',
      } as any,
    ]
    const columns = colFactory(items)

    expect(columns).toHaveLength(9)
    expect(columns[0].id).toBe('row-selection')
    expect(columns[1].id).toBe('alert')
    expect(columns[2].id).toBe('id')
  })

  it('should include all required column definitions in correct order', () => {
    const items: RedisCloudSubscription[] = [{ id: 1, name: 'test-sub' } as any]
    const columns = colFactory(items)

    const columnIds = columns.map((col) => col.id)

    expect(columnIds).toEqual([
      'row-selection',
      'alert',
      'id',
      'name',
      'type',
      'provider',
      'region',
      'numberOfDatabases',
      'status',
    ])
  })
})
