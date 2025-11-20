import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import RedisCloudDatabases from './RedisCloudDatabases'

describe('RedisCloudDatabases', () => {
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
        <RedisCloudDatabases
          selection={[]}
          columns={columnsMock}
          instances={[]}
          loading={false}
          onSelectionChange={jest.fn()}
          onClose={jest.fn()}
          onBack={jest.fn()}
          onSubmit={jest.fn()}
        />,
      ),
    ).toBeTruthy()
  })
})
