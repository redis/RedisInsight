import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { RedisClusterInstanceAddedFactory } from 'uiSrc/mocks/factories/cluster/RedisClusterInstance.factory'
import { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'
import RedisClusterDatabasesResult from './RedisClusterDatabasesResult'
import { colFactory } from './useClusterDatabasesConfig'

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

const [, colMock] = colFactory(mockInstancesSuccess)

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
