import { filterAndSort } from 'uiSrc/utils'
import { Instance, RdiInstance } from 'uiSrc/slices/interfaces'

const instances: Array<Instance | RdiInstance> = [
  {
    name: 'Instance12',
    db: 1,
    lastConnection: '2023-10-01',
    host: 'host4',
    port: 5432,
  },
  {
    name: 'Instance2',
    db: 2,
    lastConnection: '2023-10-02',
    host: 'host1',
    port: 5432,
  },
  {
    name: 'InstanceThree',
    db: 3,
    lastConnection: '2023-10-03',
    host: 'host2',
    port: 5433,
  },
]

describe('filterAndSort', () => {
  it('should return an empty array if input array is empty', () => {
    expect(
      filterAndSort([], 'test', { field: 'name', direction: 'asc' }),
    ).toEqual([])
  })

  it('should filter instances by name', () => {
    const result = filterAndSort(instances, 'instance2', {
      field: 'name',
      direction: 'asc',
    })
    expect(result).toEqual([instances[1]])
  })

  it('should filter instances by db index', () => {
    const result = filterAndSort(instances, '3', {
      field: 'name',
      direction: 'asc',
    })
    expect(result).toEqual([instances[2]])
  })

  it('should sort instances by lastConnection in ascending order', () => {
    const result = filterAndSort(instances, '', {
      field: 'lastConnection',
      direction: 'asc',
    })
    expect(result).toEqual([instances[2], instances[1], instances[0]])
  })

  it('should sort instances by lastConnection in descending order', () => {
    const result = filterAndSort(instances, '', {
      field: 'lastConnection',
      direction: 'desc',
    })
    expect(result).toEqual([instances[0], instances[1], instances[2]])
  })

  it('should sort instances by host in ascending order', () => {
    const result = filterAndSort(instances, '', {
      field: 'host',
      direction: 'asc',
    })
    expect(result).toEqual([instances[1], instances[2], instances[0]])
  })

  it('should sort instances by host in descending order', () => {
    const result = filterAndSort(instances, '', {
      field: 'host',
      direction: 'desc',
    })
    expect(result).toEqual([instances[0], instances[2], instances[1]])
  })

  it('should handle mixed filtering and sorting', () => {
    const result = filterAndSort(instances, '2', {
      field: 'lastConnection',
      direction: 'asc',
    })
    expect(result).toEqual([instances[1], instances[0]])
  })
})
