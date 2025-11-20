import type { Meta, StoryObj } from '@storybook/react-vite'
import DatabaseListOptions from './DatabaseListOptions'

const meta: Meta<typeof DatabaseListOptions> = {
  component: DatabaseListOptions,
  args: {
    options: {
      enabledDataPersistence: false,
      persistencePolicy: 'none',
      enabledRedisFlash: false,
      enabledReplication: false,
      enabledBackup: false,
      enabledActiveActive: false,
      enabledClustering: false,
      isReplicaDestination: false,
      isReplicaSource: false,
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const WithDataPersistence: Story = {
  args: {
    options: {
      ...meta.args!.options,
      enabledDataPersistence: true,
      persistencePolicy: 'aof-every-write',
    },
  },
}

export const WithRedisFlash: Story = {
  args: {
    options: {
      ...meta.args!.options,
      enabledRedisFlash: true,
    },
  },
}

export const WithReplication: Story = {
  args: {
    options: {
      ...meta.args!.options,
      enabledReplication: true,
    },
  },
}

export const WithBackup: Story = {
  args: {
    options: {
      ...meta.args!.options,
      enabledBackup: true,
    },
  },
}

export const WithActiveActive: Story = {
  args: {
    options: {
      ...meta.args!.options,
      enabledActiveActive: true,
    },
  },
}

export const WithClustering: Story = {
  args: {
    options: {
      ...meta.args!.options,
      enabledClustering: true,
    },
  },
}

export const AsReplicaSource: Story = {
  args: {
    options: {
      ...meta.args!.options,
      isReplicaSource: true,
    },
  },
}

export const AsReplicaDestination: Story = {
  args: {
    options: {
      ...meta.args!.options,
      isReplicaDestination: true,
    },
  },
}

export const WithAllOptions: Story = {
  args: {
    options: {
      ...meta.args!.options,
      enabledDataPersistence: true,
      persistencePolicy: 'aof-every-write',
      enabledRedisFlash: true,
      enabledReplication: true,
      enabledBackup: true,
      enabledActiveActive: true,
      enabledClustering: true,
      isReplicaSource: true,
    },
  },
}
