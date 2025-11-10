import type { Meta, StoryObj } from '@storybook/react-vite'

import RedisClusterDatabasesResult from './RedisClusterDatabasesResult'
import { colFactory } from './useClusterDatabasesConfig'

const [, colMock] = colFactory([])
const meta: Meta<typeof RedisClusterDatabasesResult> = {
  component: RedisClusterDatabasesResult,
  args: {
    columns: colMock,
    instances: [],
    onBack: () => {},
    onView: () => {},
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    columns: colMock,
  },
}
