import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import RedisClusterDatabasesResult from './RedisClusterDatabasesResult'

describe('RedisClusterDatabasesResult', () => {
  it('should render', () => {
    const columnsMock = [
      {
        header: 'Subscription ID',
        id: 'subscriptionId',
        accessorKey: 'subscriptionId',
        enableSorting: true,
      },
    ]
    expect(
      render(
        <RedisClusterDatabasesResult
          columns={columnsMock}
          instances={[]}
          onView={jest.fn()}
          onBack={jest.fn()}
        />,
      ),
    ).toBeTruthy()
  })
})
