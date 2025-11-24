import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { RedisClusterInstanceAddedFactory } from 'uiSrc/mocks/factories/cluster/RedisClusterInstance.factory'
import {
  AddRedisDatabaseStatus,
  InstanceRedisCluster,
} from 'uiSrc/slices/interfaces'
import RedisClusterDatabasesResult from './RedisClusterDatabasesResult'
import { redisClusterDatabasesColumns } from './config/RedisClusterDatabases.config'
import { RedisClusterIds } from './constants/constants'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'

const mockInstancesSuccess = RedisClusterInstanceAddedFactory.buildList(3, {
  statusAdded: AddRedisDatabaseStatus.Success,
})
const mockInstancesFailed = RedisClusterInstanceAddedFactory.buildList(2, {
  statusAdded: AddRedisDatabaseStatus.Fail,
})
const mockInstancesMixed = [
  ...RedisClusterInstanceAddedFactory.buildList(3, {
    statusAdded: AddRedisDatabaseStatus.Success,
  }),
  ...RedisClusterInstanceAddedFactory.buildList(2, {
    statusAdded: AddRedisDatabaseStatus.Fail,
  }),
]

const getColumnsResult = (
  instances: InstanceRedisCluster[],
): ColumnDef<InstanceRedisCluster>[] => {
  const items = instances || []
  const shouldShowCapabilities = items.some(
    (instance) => instance.modules?.length,
  )
  const shouldShowOptions = items.some(
    (instance) =>
      instance.options &&
      Object.values(instance.options).filter(Boolean).length,
  )

  return redisClusterDatabasesColumns.filter((col) => {
    if (col.id === RedisClusterIds.Selection) {
      return false
    }
    if (col.id === RedisClusterIds.Capabilities && !shouldShowCapabilities) {
      return false
    }
    return !(col.id === RedisClusterIds.Options && !shouldShowOptions)
  })
}

const colMock = getColumnsResult(mockInstancesSuccess)

const meta: Meta<typeof RedisClusterDatabasesResult> = {
  component: RedisClusterDatabasesResult,
  args: {
    columns: colMock,
    instances: [],
    onBack: fn(),
    onView: fn(),
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const AllSuccess: Story = {
  args: {
    instances: mockInstancesSuccess,
    columns: colMock,
  },
}

export const AllFailed: Story = {
  args: {
    instances: mockInstancesFailed,
    columns: colMock,
  },
}

export const Mixed: Story = {
  args: {
    instances: mockInstancesMixed,
    columns: colMock,
  },
}
