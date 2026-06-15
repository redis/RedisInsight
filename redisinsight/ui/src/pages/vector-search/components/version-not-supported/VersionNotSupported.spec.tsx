import React from 'react'
import { cloneDeep } from 'lodash'
import {
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import { VersionNotSupported } from './VersionNotSupported'

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

describe('VersionNotSupported', () => {
  it('should render with version not supported content', () => {
    render(<VersionNotSupported />, { store: createTestStore() })

    expect(screen.getByTestId('version-not-supported')).toBeInTheDocument()
    expect(
      screen.getByTestId('version-not-supported-title'),
    ).toBeInTheDocument()
  })
})
