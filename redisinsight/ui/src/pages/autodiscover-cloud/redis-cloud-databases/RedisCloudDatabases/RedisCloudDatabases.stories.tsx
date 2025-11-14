import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import RedisCloudDatabases from './'
import { colFactory } from '../utils/colFactory'

import { RowSelectionState } from 'uiSrc/components/base/layout/table'
import {
  InstanceRedisCloud,
  InstanceRedisClusterStatus,
  RedisCloudAccount,
  RedisCloudSubscriptionType,
  RedisDefaultModules,
} from 'uiSrc/slices/interfaces'

const accountMock: RedisCloudAccount = {
  accountId: 540769,
  accountName: 'Maayan',
  ownerName: 'Maayan Inc.',
  ownerEmail: 'maayan.bar-tikva@redis.com',
}

const instancesMock: InstanceRedisCloud[] = [
  {
    id: 1,
    accessKey: '',
    secretKey: '',
    credentials: null,
    account: accountMock,
    host: 'redis-12345.c52.us-east-1-4.ec2.cloud.redislabs.com',
    port: 12345,
    uid: 1001,
    name: 'production-cache',
    dnsName: 'redis-12345.c52.us-east-1-4.ec2.cloud.redislabs.com',
    address: 'redis-12345.c52.us-east-1-4.ec2.cloud.redislabs.com:12345',
    status: InstanceRedisClusterStatus.Active,
    modules: [RedisDefaultModules.ReJSON, RedisDefaultModules.Search],
    tls: true,
    options: {
      persistencePolicy: 'aof-every-1-second',
      enabledBackup: 'snapshot-every-12-hours',
      enabledActiveActive: true,
    },
    publicEndpoint: 'redis-12345.c52.us-east-1-4.ec2.cloud.redislabs.com:12345',
    databaseId: 12345678,
    subscriptionId: 87654321,
    subscriptionType: RedisCloudSubscriptionType.Flexible,
    subscriptionName: 'Production Subscription',
    free: false,
  },
  {
    id: 2,
    accessKey: '',
    secretKey: '',
    credentials: null,
    account: accountMock,
    host: 'redis-67890.c1.us-west-2.ec2.cloud.redislabs.com',
    port: 67890,
    uid: 1002,
    name: 'staging-database',
    dnsName: 'redis-67890.c1.us-west-2.ec2.cloud.redislabs.com',
    address: 'redis-67890.c1.us-west-2.ec2.cloud.redislabs.com:67890',
    status: InstanceRedisClusterStatus.Active,
    modules: [RedisDefaultModules.TimeSeries, RedisDefaultModules.Bloom],
    tls: false,
    options: {
      enabledBackup: 'snapshot-every-6-hours',
    },
    publicEndpoint: 'redis-67890.c1.us-west-2.ec2.cloud.redislabs.com:67890',
    databaseId: 23456789,
    subscriptionId: 12345678,
    subscriptionType: RedisCloudSubscriptionType.Fixed,
    subscriptionName: 'Development Subscription',
    free: true,
  },
  {
    id: 3,
    accessKey: '',
    secretKey: '',
    credentials: null,
    account: accountMock,
    host: 'redis-11111.c3.eu-west-1.ec2.cloud.redislabs.com',
    port: 11111,
    uid: 1003,
    name: 'analytics-redis',
    dnsName: 'redis-11111.c3.eu-west-1.ec2.cloud.redislabs.com',
    address: 'redis-11111.c3.eu-west-1.ec2.cloud.redislabs.com:11111',
    status: InstanceRedisClusterStatus.Active,
    modules: [RedisDefaultModules.Search, RedisDefaultModules.TimeSeries],
    tls: true,
    options: {
      enabledBackup: 'snapshot-every-1-hour',
      enabledReplication: true,
      persistencePolicy: 'aof-every-write',
      enabledDataPersistence: true,
      enabledRedisFlash: true,
      enabledActiveActive: true,
      enabledClustering: true,
      isReplicaDestination: false,
      isReplicaSource: false,
    },
    publicEndpoint: 'redis-11111.c3.eu-west-1.ec2.cloud.redislabs.com:11111',
    databaseId: 34567890,
    subscriptionId: 23456789,
    subscriptionType: RedisCloudSubscriptionType.Flexible,
    subscriptionName: '#1386214 PRODUCTION-education-services',
    free: false,
  },
]

const columns = colFactory(instancesMock)
const emptyColumns = colFactory([])

const meta: Meta<typeof RedisCloudDatabases> = {
  component: RedisCloudDatabases,
  args: {
    columns: emptyColumns,
    instances: [],
    selection: [],
    loading: true,
    onSubmit: () => {},
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

const RenderStory = () => {
  const [selection, setSelection] = useState<InstanceRedisCloud[]>([])

  const handleSelectionChange = (currentSelected: RowSelectionState) => {
    const newSelection = instancesMock.filter((item) => {
      const { id } = item
      if (!id) {
        return false
      }
      return currentSelected[id]
    })
    setSelection(newSelection)
  }

  return (
    <RedisCloudDatabases
      loading={false}
      instances={instancesMock}
      onClose={fn()}
      onBack={fn()}
      onSubmit={fn()}
      selection={selection}
      columns={columns}
      onSelectionChange={handleSelectionChange}
    />
  )
}

export const WithDatabases: Story = {
  render: () => <RenderStory />,
}
