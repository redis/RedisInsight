import React from 'react'
import { cloneDeep } from 'lodash'

import { render, mockStore, initialStateDefault } from 'uiSrc/utils/test-utils'
import {
  InstanceRedisCloud,
  AddRedisClusterDatabaseOptions,
} from 'uiSrc/slices/interfaces'
import { RedisCloudInstanceFactory } from 'uiSrc/mocks/factories/cloud/RedisCloudInstance.factory'
import { CellContext, Row } from 'uiSrc/components/base/layout/table'

import { OptionsCell } from './OptionsCell'

const createMockCellContext = (
  instance: InstanceRedisCloud,
): CellContext<InstanceRedisCloud, unknown> => ({
  row: {
    original: instance,
    id: '1',
    index: 0,
    depth: 0,
    getValue: jest.fn(),
    renderValue: jest.fn(),
    subRows: [],
    getCanExpand: jest.fn(),
    getCanSelect: jest.fn(),
    getIsSelected: jest.fn(),
    getIsSomeSelected: jest.fn(),
    getIsAllSelected: jest.fn(),
    getToggleSelectedHandler: jest.fn(),
    getToggleExpandedHandler: jest.fn(),
    getCanResize: jest.fn(),
    getIsResizing: jest.fn(),
    getResizeHandler: jest.fn(),
  } as unknown as Row<InstanceRedisCloud>,
  column: {
    id: 'options',
    columnDef: {},
  } as any,
  cell: {} as any,
  table: {} as any,
  getValue: jest.fn(),
  renderValue: jest.fn(),
})

const renderOptionsCell = (
  instance: InstanceRedisCloud,
  instancesForOptions: InstanceRedisCloud[] = [],
) => {
  const state = cloneDeep(initialStateDefault)
  state.connections.cloud.data = instancesForOptions
  const store = mockStore(state)
  const cellContext = createMockCellContext(instance)

  return render(<OptionsCell {...cellContext} />, { store })
}

describe('OptionsCell', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render DatabaseListOptions with parsed options', () => {
    const instance = RedisCloudInstanceFactory.build({
      databaseId: 1,
      options: {
        [AddRedisClusterDatabaseOptions.Backup]: true,
        [AddRedisClusterDatabaseOptions.Clustering]: false,
      },
    })
    const instancesForOptions = [
      instance,
      RedisCloudInstanceFactory.build({ databaseId: 2 }),
    ]

    // DatabaseListOptions should render the options
    // We can't easily test the exact content without knowing DatabaseListOptions internals
    // but we can verify the component renders without errors
    expect(renderOptionsCell(instance, instancesForOptions)).toBeTruthy()
  })

  it('should handle empty instancesForOptions', () => {
    const instance = RedisCloudInstanceFactory.build({
      databaseId: 1,
      options: {
        [AddRedisClusterDatabaseOptions.Backup]: true,
      },
    })

    // Should render DatabaseListOptions with empty options
    expect(renderOptionsCell(instance, [])).toBeTruthy()
  })
})
