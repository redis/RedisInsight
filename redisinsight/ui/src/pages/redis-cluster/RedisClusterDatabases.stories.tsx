import type { Meta, StoryObj } from '@storybook/react-vite'

import RedisClusterDatabases from './RedisClusterDatabases'
import { colFactory } from './RedisClusterDatabasesPage'

const meta: Meta<typeof RedisClusterDatabases> = {
  component: RedisClusterDatabases,
}

export default meta

type Story = StoryObj<typeof meta>

const [colMock] = colFactory([])

export const Default: Story = {
  args: {
    columns: colMock,
  },
}
