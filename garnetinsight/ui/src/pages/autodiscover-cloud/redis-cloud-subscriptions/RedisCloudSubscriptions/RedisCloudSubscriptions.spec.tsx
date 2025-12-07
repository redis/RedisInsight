import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
  RedisCloudSubscriptionType,
} from 'uiSrc/slices/interfaces'
import { render } from 'uiSrc/utils/test-utils'
import RedisCloudSubscriptions, { Props } from './RedisCloudSubscriptions'

const mockedProps = mock<Props>()

describe('RedisCloudSubscriptions', () => {
  it('should render', () => {
    const columnsMock = [
      {
        id: 'subscriptionId',
        accessorKey: 'subscriptionId',
        header: 'Subscription ID',
        enableSorting: true,
      },
    ]

    const subscriptionsMock: RedisCloudSubscription[] = [
      {
        id: 123,
        name: 'name',
        numberOfDatabases: 123,
        provider: 'provider',
        region: 'region',
        status: RedisCloudSubscriptionStatus.Active,
        type: RedisCloudSubscriptionType.Fixed,
        free: false,
      },
    ]
    expect(
      render(
        <RedisCloudSubscriptions
          {...instance(mockedProps)}
          columns={columnsMock}
          subscriptions={subscriptionsMock}
        />,
      ),
    ).toBeTruthy()
  })
})
