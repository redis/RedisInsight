import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { RedisClusterInstanceFactory } from 'uiSrc/mocks/factories/cluster/RedisClusterInstance.factory'
import RedisClusterDatabases from './RedisClusterDatabases'
import { redisClusterDatabasesColumns } from './config/RedisClusterDatabases.config'
import { RedisClusterIds } from './constants/constants'
import type { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'

const emptyInstances: InstanceRedisCluster[] = []
const mockInstances = RedisClusterInstanceFactory.buildList(5)
const mockManyInstances = RedisClusterInstanceFactory.buildList(15)

const getColumns = (
  instances: InstanceRedisCluster[],
): ColumnDef<InstanceRedisCluster>[] => {
  const items = instances || []
  const shouldShowSelection = items.length > 0
  const shouldShowCapabilities = items.some(
    (instance) => instance.modules?.length,
  )
  const shouldShowOptions = items.some(
    (instance) =>
      instance.options &&
      Object.values(instance.options).filter(Boolean).length,
  )

  return redisClusterDatabasesColumns.filter((col) => {
    if (col.id === RedisClusterIds.Selection && !shouldShowSelection) {
      return false
    }
    if (col.id === RedisClusterIds.Capabilities && !shouldShowCapabilities) {
      return false
    }
    if (col.id === RedisClusterIds.Options && !shouldShowOptions) {
      return false
    }
    return col.id !== RedisClusterIds.Result
  })
}

const emptyColumns = getColumns(emptyInstances)
const columnsWithData = getColumns(mockInstances)
const columnsWithManyData = getColumns(mockManyInstances)

const meta: Meta<typeof RedisClusterDatabases> = {
  component: RedisClusterDatabases,
  args: {
    columns: emptyColumns,
    instances: emptyInstances,
    loading: false,
    onClose: fn(),
    onBack: fn(),
    onSubmit: fn(),
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const WithDatabases: Story = {
  args: {
    instances: mockInstances,
    columns: columnsWithData,
  },
}

export const WithManyDatabases: Story = {
  args: {
    instances: mockManyInstances,
    columns: columnsWithManyData,
  },
}

export const Loading: Story = {
  args: {
    instances: emptyInstances,
    columns: emptyColumns,
    loading: true,
  },
}
