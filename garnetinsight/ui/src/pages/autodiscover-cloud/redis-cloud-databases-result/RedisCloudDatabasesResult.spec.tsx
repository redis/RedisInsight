import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import RedisCloudDatabasesResult from './RedisCloudDatabasesResult'

describe('RedisCloudDatabasesResult', () => {
  it('should render', () => {
    const columnsMock = [
      {
        id: 'subscriptionId',
        accessorKey: 'subscriptionId',
        header: 'Subscription ID',
        enableSorting: true,
      },
    ]
    expect(
      render(
        <RedisCloudDatabasesResult
          columns={columnsMock}
          instances={[]}
          onView={jest.fn()}
          onBack={jest.fn()}
        />,
      ),
    ).toBeTruthy()
  })
})
