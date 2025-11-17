import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { DBInstanceFactory } from 'uiSrc/mocks/factories/database/DBInstance.factory'
import { NO_CA_CERT } from 'uiSrc/pages/home/constants'
import ManualConnectionForm from './'

const conn = DBInstanceFactory.build()
const meta: Meta<typeof ManualConnectionForm> = {
  component: ManualConnectionForm,
  args: {
    formFields: {
      ...conn,
      port: conn.port.toString(),
      selectedCaCertName: NO_CA_CERT,
    } as any,
    loading: false,
    isEditMode: false,
    isCloneMode: false,
    setIsCloneMode: fn(),
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const AddConnection: Story = {}
export const CloneConnection: Story = {
  args: {
    ...meta.args,
    isCloneMode: true,
  },
}
export const EditConnection: Story = {
  args: {
    ...meta.args,
    isEditMode: true,
  },
}

export const EditWithNodesConnection: Story = {
  args: {
    ...meta.args,
    formFields: {
      ...conn,
      port: conn.port.toString(),
      selectedCaCertName: NO_CA_CERT,
      nodes: [
        {
          host: '127.0.0.1',
          port: 6666,
        },
        {
          host: '127.0.0.1',
          port: 7777,
        },
      ],
    } as any,
    isEditMode: true,
  },
}
