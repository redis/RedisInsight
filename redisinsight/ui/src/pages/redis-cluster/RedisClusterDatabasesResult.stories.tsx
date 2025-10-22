import type { Meta, StoryObj } from '@storybook/react-vite'

import RedisClusterDatabasesResult from './RedisClusterDatabasesResult'
import { colFactory } from './RedisClusterDatabasesPage'

const meta: Meta<typeof RedisClusterDatabasesResult> = {
  component: RedisClusterDatabasesResult,
}

export default meta

type Story = StoryObj<typeof meta>

const [, colMock] = colFactory([])

export const Default: Story = {
  args: {
    columns: colMock,
  },
}
