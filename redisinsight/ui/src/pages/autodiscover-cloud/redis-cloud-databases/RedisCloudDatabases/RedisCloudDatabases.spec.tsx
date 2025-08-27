import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import RedisCloudDatabases, { Props } from './RedisCloudDatabases'

const mockedProps = mock<Props>()

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
          {...instance(mockedProps)}
          columns={columnsMock}
        />,
      ),
    ).toBeTruthy()
  })
})
