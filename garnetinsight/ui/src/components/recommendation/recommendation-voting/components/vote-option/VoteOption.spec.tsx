import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import { setRecommendationVote } from 'uiSrc/slices/analytics/dbAnalysis'
import { Vote } from 'uiSrc/constants/recommendations'
import {
  cleanup,
  mockedStore,
  fireEvent,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import VoteOption, { Props } from './VoteOption'

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

describe('VoteOption', () => {
  it('should render', () => {
    expect(render(<VoteOption {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render proper text for Like vote', async () => {
    render(
      <VoteOption
        {...instance(mockedProps)}
        voteOption={Vote.Like}
        popover={Vote.Like}
      />,
    )

    expect(screen.getByTestId('common-text')).toHaveTextContent(
      'Thank you for the feedback.',
    )
    expect(screen.getByTestId('custom-text')).toHaveTextContent(
      'Share your ideas with us.',
    )
  })

  it('should render proper text for Dislike vote', () => {
    render(<VoteOption {...instance(mockedProps)} vote={Vote.Dislike} />)
    expect(screen.getByTestId('common-text')).toHaveTextContent(
      'Thank you for the feedback.',
    )
    expect(screen.getByTestId('custom-text')).toHaveTextContent(
      'Tell us how we can improve.',
    )
  })

  it('should call "setRecommendationVote" action be called after click "useful-vote-btn"', () => {
    render(
      <VoteOption
        {...instance(mockedProps)}
        isAnalyticsEnable
        voteOption={Vote.Like}
        vote={Vote.Like}
        setPopover={() => {}}
      />,
    )
    fireEvent.click(screen.getByTestId('useful-vote-btn'))

    const expectedActions = [setRecommendationVote()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call "setRecommendationVote" action be called after click "not-useful-vote-btn"', () => {
    render(
      <VoteOption
        {...instance(mockedProps)}
        isAnalyticsEnable
        voteOption={Vote.Dislike}
        vote={Vote.Dislike}
        setPopover={() => {}}
      />,
    )
    fireEvent.click(screen.getByTestId('not useful-vote-btn'))

    const expectedActions = [setRecommendationVote()]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
