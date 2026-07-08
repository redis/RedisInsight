import React from 'react'
import { cloneDeep } from 'lodash'
import {
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import { RedisSearchNotAvailable } from './RedisSearchNotAvailable'

const createTestStore = () => {
  const state = cloneDeep(initialStateDefault)
  state.app.features.featureFlags = {
    loading: false,
    features: {
      [FeatureFlags.cloudSso]: { flag: true },
      [FeatureFlags.cloudAds]: { flag: true },
      [FeatureFlags.envDependent]: { flag: true },
    },
  }
  return mockStore(state)
}

describe('RedisSearchNotAvailable', () => {
  it('should render with Redis Search not available content', () => {
    render(<RedisSearchNotAvailable />, { store: createTestStore() })

    expect(screen.getByTestId('redis-search-not-available')).toBeInTheDocument()
    expect(
      screen.getByTestId('redis-search-not-available-title'),
    ).toBeInTheDocument()
  })
})
