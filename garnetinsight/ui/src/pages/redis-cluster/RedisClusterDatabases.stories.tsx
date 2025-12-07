import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { RedisClusterInstanceFactory } from 'uiSrc/mocks/factories/cluster/RedisClusterInstance.factory'
import RedisClusterDatabases from './RedisClusterDatabases'
import { colFactory } from './useClusterDatabasesConfig'

const emptyInstances: [] = []
const mockInstances = RedisClusterInstanceFactory.buildList(5)
const mockManyInstances = RedisClusterInstanceFactory.buildList(15)

const [emptyColumns] = colFactory(emptyInstances)
const [columnsWithData] = colFactory(mockInstances)
const [columnsWithManyData] = colFactory(mockManyInstances)

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
