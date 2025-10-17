import type { Meta, StoryObj } from '@storybook/react-vite'

import { ConnectionType, Instance } from 'uiSrc/slices/interfaces'
import DatabasesListWrapper from './DatabasesListWrapper'

const mockInstances: Instance[] = [
  {
    id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
    host: 'localhost',
    port: 6379,
    name: 'localhost',
    username: null,
    password: null,
    connectionType: ConnectionType.Standalone,
    nameFromProvider: null,
    new: true,
    modules: [],
    version: null,
    lastConnection: new Date('2021-04-22T09:03:56.917Z'),
    provider: 'provider',
  },
  {
    id: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
    host: 'localhost',
    port: 12000,
    name: 'oea123123',
    username: null,
    password: null,
    connectionType: ConnectionType.Standalone,
    nameFromProvider: null,
    tls: true,
    modules: [],
    version: null,
  },
]

const meta = {
  component: DatabasesListWrapper,
} satisfies Meta<typeof DatabasesListWrapper>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    instances: mockInstances,
    loading: false,
    editedInstance: null,
    onEditInstance: () => {},
    onDeleteInstances: () => {},
    onManageInstanceTags: () => {},
  },
}

export const Loading: Story = {
  args: {
    instances: [],
    loading: true,
    editedInstance: null,
    onEditInstance: () => {},
    onDeleteInstances: () => {},
    onManageInstanceTags: () => {},
  },
}

export const Empty: Story = {
  args: {
    instances: [],
    loading: false,
    editedInstance: null,
    onEditInstance: () => {},
    onDeleteInstances: () => {},
    onManageInstanceTags: () => {},
  },
}
