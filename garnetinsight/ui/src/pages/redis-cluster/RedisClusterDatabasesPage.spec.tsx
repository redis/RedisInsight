import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import { clusterSelector } from 'uiSrc/slices/instances/cluster'
import RedisClusterDatabasesPage from './RedisClusterDatabasesPage'

jest.mock('uiSrc/slices/instances/cluster', () => ({
  ...jest.requireActual('uiSrc/slices/instances/cluster'),
  clusterSelector: jest.fn().mockReturnValue({
    data: [
      {
        id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
        host: 'localhost',
        port: 6379,
        name: 'localhost',
        username: null,
        password: null,
        connectionType: 'STANDALONE',
        nameFromProvider: null,
        new: true,
        lastConnection: new Date('2021-04-22T09:03:56.917Z'),
      },
      {
        id: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
        host: 'localhost',
        port: 12000,
        name: 'oea123123',
        username: null,
        password: null,
        connectionType: 'STANDALONE',
        nameFromProvider: null,
        lastConnection: null,
        tls: {
          verifyServerCert: true,
          caCertId: '70b95d32-c19d-4311-bb24-e684af12cf15',
          clientCertPairId: '70b95d32-c19d-4311-b23b24-e684af12cf15',
        },
      },
    ],
    dataAdded: [],
  }),
}))

/**
 * RedisClusterDatabasesPage tests
 *
 * @group component
 */
describe('RedisClusterDatabasesPage', () => {
  it('should render with added column', () => {
    expect(render(<RedisClusterDatabasesPage />)).toBeTruthy()
  })
  it('should render table', () => {
    const { queryByTestId } = render(<RedisClusterDatabasesPage />)
    expect(queryByTestId('db_name_localhost')).toBeInTheDocument()
  })
  it('should render', () => {
    ;(clusterSelector as jest.Mock).mockReturnValueOnce({
      data: [],
      dataAdded: [],
    })

    expect(render(<RedisClusterDatabasesPage />)).toBeTruthy()
  })
})
