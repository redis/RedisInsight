import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import RedisCloudSubscriptions from './RedisCloudSubscriptions'
import { colFactory } from '../useCloudSubscriptionConfig'
import {
  RedisCloudAccount,
  RedisCloudSubscription,
} from 'uiSrc/slices/interfaces'
import { RowSelectionState } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscriptionFactory } from 'uiSrc/mocks/factories/cloud/RedisCloudSubscription.factory'

const subscriptionsMock: RedisCloudSubscription[] =
  RedisCloudSubscriptionFactory.buildList(3)
const subscriptions100: RedisCloudSubscription[] =
  RedisCloudSubscriptionFactory.buildList(100)

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

const RenderStory = ({
  account,
  columns,
  subscriptions,
}: {
  account: RedisCloudAccount
  columns: ReturnType<typeof colFactory>
  subscriptions: RedisCloudSubscription[]
}) => {
  const [selection, setSelection] = useState<RedisCloudSubscription[]>([])

  const handleSelectionChange = (currentSelected: RowSelectionState) => {
    const newSelection = subscriptions.filter((item) => {
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
      subscriptions={subscriptions}
      loading={false}
      account={account}
      onSubmit={fn()}
    />
  )
}

export const WithSubscription: Story = {
  render: () => (
    <RenderStory
      account={accountMock}
      columns={colFactory(subscriptionsMock)}
      subscriptions={subscriptionsMock}
    />
  ),
}

export const With100Subscriptions: Story = {
  render: () => (
    <RenderStory
      account={accountMock}
      columns={colFactory(subscriptions100)}
      subscriptions={subscriptions100}
    />
  ),
}
