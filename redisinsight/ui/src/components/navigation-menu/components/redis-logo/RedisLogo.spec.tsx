import React from 'react'
import { cloneDeep, set } from 'lodash'
import {
  cleanup,
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import { SideBar } from 'uiSrc/components/base/layout/sidebar'
import { RedisLogo } from './RedisLogo'

beforeEach(() => {
  cleanup()
  jest.clearAllMocks()
})

describe('RedisLogo', () => {
  it('should have link if envDependent feature is on', () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true },
    )
    render(
      <SideBar isExpanded={false}>
        <RedisLogo isRdiWorkspace={false} />
      </SideBar>,
      {
        store: mockStore(initialStoreState),
      },
    )

    expect(screen.getByTestId('redis-logo-link')).toBeInTheDocument()
  })

  it('should not have link if envDependent feature is off', () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )
    render(
      <SideBar isExpanded={false}>
        <RedisLogo isRdiWorkspace={false} />
      </SideBar>,
      {
        store: mockStore(initialStoreState),
      },
    )

    expect(screen.queryByTestId('redis-logo-link')).not.toBeInTheDocument()
  })
})
