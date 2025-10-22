import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { NO_CA_CERT } from 'uiSrc/pages/home/constants'

import ManualConnectionForm from './'

const conn = {
  timeout: undefined,
  compressor: 'NONE',
  keyNameFormat: 'Unicode',
  id: '13bd1fb0-0af6-4433-b138-99eba801f3fe',
  host: '127.0.0.1',
  port: '6666',
  name: '127.0.0.1:6666',
  db: undefined,
  username: undefined,
  connectionType: 'STANDALONE',
  nameFromProvider: undefined,
  provider: 'REDIS_STACK',
  lastConnection: '2025-10-17T06:29:06.536Z',
  createdAt: '2025-10-17T06:28:55.000Z',
  nodes: [],
  modules: [
    { name: 'timeseries', version: 11202, semanticVersion: '1.12.2' },
    { name: 'search', version: 21005, semanticVersion: '2.10.5' },
    { name: 'ReJSON', version: 20803, semanticVersion: '2.8.3' },
    { name: 'bf', version: 20802, semanticVersion: '2.8.2' },
    { name: 'redisgears_2', version: 20020 },
  ],
  tls: undefined,
  tlsServername: undefined,
  verifyServerCert: undefined,
  caCert: undefined,
  clientCert: undefined,
  new: false,
  ssh: undefined,
  cloudDetails: undefined,
  version: '7.4.0',
  forceStandalone: undefined,
  tags: [],
  isPreSetup: undefined,
  sshOptions: undefined,
  selectedCaCertName: NO_CA_CERT,
}
const meta: Meta<typeof ManualConnectionForm> = {
  component: ManualConnectionForm,
  args: {
    // @ts-ignore
    formFields: {
      ...conn,
    },

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
    // @ts-ignore
    formFields: {
      ...conn,
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
    },
    isEditMode: true,
  },
}
