import React from 'react'
import { cloneDeep, set } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  cleanup,
  initialStateDefault,
  mockStore,
} from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FeatureFlags } from 'uiSrc/constants'
import { closeWhatsNew } from 'uiSrc/slices/app/whatsNew'
import { setReleaseNotesViewed } from 'uiSrc/slices/app/info'
import { whatsNewFeed } from 'uiSrc/utils'
import WhatsNewModal from './WhatsNewModal'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const latestVersion = whatsNewFeed[0].version

// Card-level assertions pin to a shipped version so they don't churn when a
// new release is added to the top of the feed. 3.6.0 has both a flag-gated
// card (vector-sets) and an unflagged one (geodata-workbench).
const CONTENT_VERSION = '3.6.0'

const getOpenState = (flagsOn = false, version = latestVersion) => {
  let state = set(cloneDeep(initialStateDefault), 'app.whatsNew', {
    isOpen: true,
    selectedVersion: version,
    lastVersionSeen: null,
  })
  if (flagsOn) {
    state = set(
      state,
      `app.features.featureFlags.features.${FeatureFlags.vectorSet}`,
      { flag: true },
    )
    state = set(
      state,
      `app.features.featureFlags.features.${FeatureFlags.prodMode}`,
      { flag: true },
    )
  }
  return state
}

beforeEach(() => {
  cleanup()
})

describe('WhatsNewModal', () => {
  it('should not render when closed', () => {
    render(<WhatsNewModal />)
    expect(screen.queryByTestId('whats-new-cards')).not.toBeInTheDocument()
  })

  it('should render when open with the version selector', () => {
    render(<WhatsNewModal />, { store: mockStore(getOpenState()) })

    expect(screen.getByTestId('whats-new-cards')).toBeInTheDocument()
    expect(screen.getByTestId('whats-new-version-select')).toBeInTheDocument()
  })

  it('should link full release notes to the selected version', () => {
    render(<WhatsNewModal />, { store: mockStore(getOpenState()) })

    expect(screen.getByTestId('whats-new-release-notes-link')).toHaveAttribute(
      'href',
      expect.stringContaining(`/tag/${latestVersion}`),
    )
  })

  it('should show where to find a feature', () => {
    render(<WhatsNewModal />, {
      store: mockStore(getOpenState(false, CONTENT_VERSION)),
    })

    expect(
      screen.getByTestId('whats-new-card-location-geodata-workbench'),
    ).toBeInTheDocument()
  })

  it('should show flag-gated cards marked as coming soon when their flags are off', () => {
    render(<WhatsNewModal />, {
      store: mockStore(getOpenState(false, CONTENT_VERSION)),
    })

    expect(screen.getByTestId('whats-new-card-vector-sets')).toBeInTheDocument()
    expect(
      screen.getByTestId('whats-new-card-inactive-vector-sets'),
    ).toBeInTheDocument()
    // unflagged card carries no indicator
    expect(
      screen.queryByTestId('whats-new-card-inactive-geodata-workbench'),
    ).not.toBeInTheDocument()
  })

  it('should show versions whose cards are all flag-gated off', () => {
    // 3.2.0's only card is azure-gated and azure is off here
    const state = set(getOpenState(), 'app.whatsNew.selectedVersion', '3.2.0')

    render(<WhatsNewModal />, { store: mockStore(state) })

    expect(
      screen.getByTestId('whats-new-card-azure-managed-redis'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('whats-new-release-notes-link')).toHaveAttribute(
      'href',
      expect.stringContaining('/tag/3.2.0'),
    )
  })

  it('should not mark flag-gated cards when their flags are on', () => {
    render(<WhatsNewModal />, {
      store: mockStore(getOpenState(true, CONTENT_VERSION)),
    })

    expect(screen.getByTestId('whats-new-card-vector-sets')).toBeInTheDocument()
    expect(
      screen.queryByTestId('whats-new-card-inactive-vector-sets'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('whats-new-card-inactive-dev-vs-prod-mode'),
    ).not.toBeInTheDocument()
  })

  it('should dispatch close and send telemetry on "Got it"', () => {
    const store = mockStore(getOpenState())
    render(<WhatsNewModal />, { store })

    fireEvent.click(screen.getByTestId('whats-new-got-it-btn'))

    expect(store.getActions()).toEqual([closeWhatsNew()])
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.WHATS_NEW_CLOSED,
      eventData: { version: latestVersion },
    })
  })

  it('should acknowledge a pending update for the running version on close', () => {
    // set by ipcCheckUpdates only after the updated version is running
    const state = set(
      getOpenState(),
      'app.info.electron.isReleaseNotesViewed',
      false,
    )
    const store = mockStore(state)
    render(<WhatsNewModal />, { store })

    fireEvent.click(screen.getByTestId('whats-new-got-it-btn'))

    expect(store.getActions()).toEqual([
      setReleaseNotesViewed(true),
      closeWhatsNew(),
    ])
  })
})
