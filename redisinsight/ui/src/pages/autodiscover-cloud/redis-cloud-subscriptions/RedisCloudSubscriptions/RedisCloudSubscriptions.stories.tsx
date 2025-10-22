import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import RedisCloudSubscriptions from './RedisCloudSubscriptions'
import { colFactory } from '../useCloudSubscriptionConfig'
import {
  RedisCloudAccount,
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
  RedisCloudSubscriptionType,
} from 'uiSrc/slices/interfaces'
import { RowSelectionState } from 'uiSrc/components/base/layout/table'

const subscriptionsMock: RedisCloudSubscription[] = [
  {
    id: 12345678,
    name: 'redis-15797.c52.us-east-1-4.ec2.cloud',
    numberOfDatabases: 1,
    provider: 'google',
    region: 'us-east-1',
    status: RedisCloudSubscriptionStatus.Active,
    type: RedisCloudSubscriptionType.Fixed,
    free: false,
  },
  {
    id: 87654321,
    name: 'redis-15797.c52.us-east-1-4.ec2.cloud...',
    numberOfDatabases: 2,
    provider: 'aws',
    region: 'us-east-1',
    status: RedisCloudSubscriptionStatus.Active,
    type: RedisCloudSubscriptionType.Flexible,
    free: true,
  },
  {
    id: 23456789,
    name: '#1386214 PRODUCTION-education-services',
    numberOfDatabases: 0,
    provider: 'aws',
    region: 'us-east-1',
    status: RedisCloudSubscriptionStatus.Pending,
    type: RedisCloudSubscriptionType.Fixed,
    free: false,
  },
]

const columns = colFactory(subscriptionsMock)
const emptyColumns = colFactory([])

const accountMock: RedisCloudAccount = {
  accountId: 540769,
  accountName: 'Maayan',
  ownerName: 'Maayan Inc.',
  ownerEmail: 'maayan.bar-tikva@redis.com',
}
const meta: Meta<typeof RedisCloudSubscriptions> = {
  component: RedisCloudSubscriptions,
  args: {
    columns: emptyColumns,
    subscriptions: [],
    selection: [],
    account: null,
    loading: false,
    onSubmit: () => {},
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

const RenderStory = () => {
  const [selection, setSelection] = useState<RedisCloudSubscription[]>([])

  const handleSelectionChange = (currentSelected: RowSelectionState) => {
    const newSelection = subscriptionsMock.filter((item) => {
      const { id } = item
      if (!id) {
        return false
      }
      return currentSelected[id]
    })
    setSelection(newSelection)
  }

  return (
    <RedisCloudSubscriptions
      error=""
      onClose={fn()}
      onBack={fn()}
      onSelectionChange={handleSelectionChange}
      selection={selection}
      columns={columns}
      subscriptions={subscriptionsMock}
      loading={false}
      account={accountMock}
      onSubmit={fn()}
    />
  )
}

export const WithSubscription: Story = {
  render: () => <RenderStory />,
}
