import type { Meta, StoryObj } from '@storybook/react-vite'
import { action } from 'storybook/actions'

import { DBInstanceFactory } from 'uiSrc/mocks/factories/database/DBInstance.factory'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import DatabasePanelDialog from './index'

const meta = {
  component: DatabasePanelDialog,
} satisfies Meta<typeof DatabasePanelDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    editMode: false,
    editedInstance: null,
    onClose: action('onClose'),
  },
}

const mockInstance = DBInstanceFactory.build({
  id: '13bd1fb0-0af6-4433-b138-99eba801f3fe',
  host: '127.0.0.1',
  port: 6666,
  name: '127.0.0.1:6666',
  connectionType: ConnectionType.Standalone,
  provider: 'REDIS_STACK',
  lastConnection: new Date('2025-10-17T06:29:06.536Z'),
  modules: [
    { name: 'timeseries', version: 11202, semanticVersion: '1.12.2' },
    { name: 'search', version: 21005, semanticVersion: '2.10.5' },
    { name: 'ReJSON', version: 20803, semanticVersion: '2.8.3' },
    { name: 'bf', version: 20802, semanticVersion: '2.8.2' },
    { name: 'redisgears_2', version: 20020, semanticVersion: '2.0.20' },
  ],
  version: '7.4.0',
})

export const EditModeTrue: Story = {
  args: {
    editMode: true,
    editedInstance: mockInstance,
    onClose: action('onClose'),
  },
}
