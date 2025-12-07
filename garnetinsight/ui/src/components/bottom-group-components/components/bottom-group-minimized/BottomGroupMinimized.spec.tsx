import React from 'react'
import { cloneDeep, set } from 'lodash'

import { toggleCli, toggleCliHelper } from 'uiSrc/slices/cli/cli-settings'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  initialStateDefault,
  mockStore,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import BottomGroupMinimized from './BottomGroupMinimized'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('BottomGroupMinimized', () => {
  it('should render', () => {
    expect(render(<BottomGroupMinimized />)).toBeTruthy()
  })

  it('should "toggleCli" action be called after click "expand-cli" button', () => {
    render(<BottomGroupMinimized />)
    fireEvent.click(screen.getByTestId('expand-cli'))

    const expectedActions = [toggleCli()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should "toggleCliHelper" action be called after click "expand-command-helper" button', () => {
    render(<BottomGroupMinimized />)
    fireEvent.click(screen.getByTestId('expand-command-helper'))

    const expectedActions = [toggleCliHelper()]
    expect(store.getActions()).toEqual(expectedActions)
  })
  it('should show "Profiler" and "user-survey-link" when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true },
    )

    render(<BottomGroupMinimized />, {
      store: mockStore(initialStoreState),
    })
    expect(screen.queryByTestId('expand-monitor')).toBeInTheDocument()
    expect(screen.queryByTestId('user-survey-link')).toBeInTheDocument()
  })

  it('should hide "Profiler" and "user-survey-link" when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )

    render(<BottomGroupMinimized />, {
      store: mockStore(initialStoreState),
    })
    expect(screen.queryByTestId('expand-monitor')).not.toBeInTheDocument()
    expect(screen.queryByTestId('user-survey-link')).not.toBeInTheDocument()
  })
})
