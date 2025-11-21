import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import RedisCloudSubscriptions from './RedisCloudSubscriptions'
import { redisCloudSubscriptionsColumns } from '../../config/RedisCloudSubscriptions.config'
import {
  RedisCloudAccount,
  RedisCloudSubscription,
} from 'uiSrc/slices/interfaces'
import {
  RowSelectionState,
  ColumnDef,
} from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscriptionFactory } from 'uiSrc/mocks/factories/cloud/RedisCloudSubscription.factory'
import { RedisCloudAccountFactory } from 'uiSrc/mocks/factories/cloud/RedisCloudAccount.factory'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

const emptyColumns = redisCloudSubscriptionsColumns.filter(
  (col) =>
    col.id !== AutoDiscoverCloudIds.Selection &&
    col.id !== AutoDiscoverCloudIds.Alert,
)

const accountMock = RedisCloudAccountFactory.build()
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
  columns: ColumnDef<RedisCloudSubscription>[]
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
  render: () => {
    const subscriptionsMock: RedisCloudSubscription[] =
      RedisCloudSubscriptionFactory.buildList(3)
    return (
      <RenderStory
        account={accountMock}
        columns={redisCloudSubscriptionsColumns}
        subscriptions={subscriptionsMock}
      />
    )
  },
}

export const With100Subscriptions: Story = {
  render: () => {
    const subscriptionsMock: RedisCloudSubscription[] =
      RedisCloudSubscriptionFactory.buildList(100)
    return (
      <RenderStory
        account={accountMock}
        columns={redisCloudSubscriptionsColumns}
        subscriptions={subscriptionsMock}
      />
    )
  },
}
