import React from 'react'
import { cloneDeep } from 'lodash'
import {
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import { RqeNotAvailable } from './RqeNotAvailable'

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

describe('RqeNotAvailable', () => {
  it('should render with RQE not available content', () => {
    render(<RqeNotAvailable />, { store: createTestStore() })

    expect(screen.getByTestId('rqe-not-available')).toBeInTheDocument()
    expect(screen.getByTestId('rqe-not-available-title')).toBeInTheDocument()
  })
})
