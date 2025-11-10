import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import RedisClusterDatabases from './RedisClusterDatabases'
import { colFactory } from './useClusterDatabasesConfig'

const [colMock] = colFactory([])

const meta: Meta<typeof RedisClusterDatabases> = {
  component: RedisClusterDatabases,
  args: {
    columns: colMock,
    instances: [],
    loading: false,
    onClose: fn(),
    onBack: fn(),
    onSubmit: fn(),
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}
