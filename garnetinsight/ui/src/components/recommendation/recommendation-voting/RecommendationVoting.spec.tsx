import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'

import {
  act,
  cleanup,
  mockedStore,
  fireEvent,
  render,
  screen,
  waitForRiPopoverVisible,
  waitForRiTooltipVisible,
} from 'uiSrc/utils/test-utils'

import RecommendationVoting, { Props } from './RecommendationVoting'

const mockedProps = mock<Props>()

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/user/user-settings', () => ({
  ...jest.requireActual('uiSrc/slices/user/user-settings'),
  userSettingsConfigSelector: jest.fn().mockReturnValue({
    agreements: {
      analytics: true,
    },
  }),
}))

describe('RecommendationVoting', () => {
  it('should render', () => {
    expect(
      render(<RecommendationVoting {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should render popover after click "not-useful-vote-btn"', async () => {
    render(<RecommendationVoting {...instance(mockedProps)} />)

    expect(
      document.querySelector('[data-test-subj="github-repo-link"]'),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('not useful-vote-btn'))
    await waitForRiPopoverVisible()

    expect(
      document.querySelector('[data-test-subj="github-repo-link"]'),
    ).toHaveAttribute(
      'href',
      'https://github.com/Garnetinsight/Garnetinsight/issues/new/choose',
    )
  })

  it('should render proper popover and btn should be disabled"', async () => {
    ;(userSettingsConfigSelector as jest.Mock).mockImplementation(() => ({
      agreements: {
        analytics: false,
      },
    }))
    render(<RecommendationVoting {...instance(mockedProps)} />)

    await act(async () => {
      fireEvent.focus(screen.getByTestId('not useful-vote-btn'))
    })
    await waitForRiTooltipVisible()

    expect(screen.getByTestId('not useful-vote-tooltip')).toHaveTextContent(
      'Enable Analytics on the Settings page to vote for a tip',
    )
    expect(screen.getByTestId('not useful-vote-btn')).toBeDisabled()
  })
})
