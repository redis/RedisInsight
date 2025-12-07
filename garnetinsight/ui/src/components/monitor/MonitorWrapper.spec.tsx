import { cloneDeep, set } from 'lodash'
import React from 'react'
import {
  cleanup,
  mockedStore,
  render,
  screen,
  initialStateDefault,
  mockStore,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import MonitorWrapper from './MonitorWrapper'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('MonitorWrapper', () => {
  it('should render', () => {
    expect(render(<MonitorWrapper />)).toBeTruthy()
  })

  it('MonitorWrapper should be in the Document', () => {
    render(<MonitorWrapper />)

    const monitorWrapper = screen.queryByTestId('monitor-container')

    expect(monitorWrapper).toBeInTheDocument()
  })

  it('MonitorWrapper should be in the Document', () => {
    render(<MonitorWrapper />)

    const monitor = screen.queryByTestId('monitor')

    expect(monitor).toBeInTheDocument()
  })

  it('MonitorHeader should be in the Document', () => {
    render(<MonitorWrapper />)

    const monitorHeader = screen.queryByTestId('monitor-header')

    expect(monitorHeader).toBeInTheDocument()
  })

  it('should show feature dependent items when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true },
    )

    render(<MonitorWrapper />, {
      store: mockStore(initialStoreState),
    })
    expect(screen.queryByTestId('monitor')).toBeInTheDocument()
    expect(screen.queryByTestId('monitor-header')).toBeInTheDocument()
    expect(
      screen.queryByTestId('monitor-not-supported'),
    ).not.toBeInTheDocument()
  })

  it('should hide feature dependent items when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )

    render(<MonitorWrapper />, {
      store: mockStore(initialStoreState),
    })
    expect(screen.queryByTestId('monitor')).not.toBeInTheDocument()
    expect(screen.queryByTestId('monitor-header')).not.toBeInTheDocument()
    expect(screen.queryByTestId('monitor-not-supported')).toBeInTheDocument()
  })
})
