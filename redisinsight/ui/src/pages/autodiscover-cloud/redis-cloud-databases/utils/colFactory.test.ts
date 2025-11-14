import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { colFactory } from './colFactory'

describe('colFactory', () => {
  it('should return columns without selection column when instances array is empty', () => {
    const instances: InstanceRedisCloud[] = []

    const columns = colFactory(instances)

    expect(columns).toHaveLength(8)
    expect(columns[0].id).toBe('name')
  })

  it('should return columns with selection column when instances array has items', () => {
    const instances: InstanceRedisCloud[] = [
      {
        databaseId: 1,
        name: 'test-db',
        subscriptionId: 1,
        subscriptionType: 1,
        free: false,
      } as any,
    ]

    const columns = colFactory(instances)

    expect(columns).toHaveLength(9)
    expect(columns[0].id).toBe('row-selection')
    expect(columns[1].id).toBe('name')
  })

  it('should include all required column definitions in correct order', () => {
    const instances: InstanceRedisCloud[] = [
      { databaseId: 1, name: 'test-db' } as any,
    ]

    const columns = colFactory(instances)

    const columnIds = columns.map((col) => col.id)

    expect(columnIds).toEqual([
      'row-selection',
      'name',
      'subscriptionId',
      'subscriptionName',
      'subscriptionType',
      'status',
      'publicEndpoint',
      'modules',
      'options',
    ])
  })

  it('should pass instances to optionsColumn', () => {
    const instances: InstanceRedisCloud[] = [
      { databaseId: 1, name: 'test-db' } as any,
      { databaseId: 2, name: 'test-db-2' } as any,
    ]

    const columns = colFactory(instances)

    // The options column should be the last one
    const optionsColumn = columns[columns.length - 1]
    expect(optionsColumn.id).toBe('options')
  })
})
