import React from 'react'
import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import { render } from 'uiSrc/utils/test-utils'

import RedisCloudSubscriptionsPage from './RedisCloudSubscriptionsPage'

jest.mock('uiSrc/slices/instances/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/instances/cloud'),
  cloudSelector: jest.fn().mockReturnValue({
    ...jest.requireActual('uiSrc/slices/instances/cloud').initialState,
  }),
}))

/**
 * RedisCloudSubscriptionsPage tests
 *
 * @group component
 */
describe('RedisCloudSubscriptionsPage', () => {
  it('should render', () => {
    expect(render(<RedisCloudSubscriptionsPage />)).toBeTruthy()
  })

  it('should render with subscriptions', () => {
    const cloudSelectorMock = jest.fn().mockReturnValue({
      credentials: null,
      loading: false,
      error: '',
      loaded: { instances: false },
      account: { error: '', data: [] },
      subscriptions: [
        {
          id: 123,
          name: 'name',
          numberOfDatabases: 123,
          provider: 'provider',
          region: 'region',
          status: 'active',
        },
      ],
    })
    cloudSelector.mockImplementation(cloudSelectorMock)
    expect(render(<RedisCloudSubscriptionsPage />)).toBeTruthy()
  })
})
