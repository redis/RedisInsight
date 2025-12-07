import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import RecommendationBadges, { Props } from './RecommendationBadges'

const mockedProps = mock<Props>()

describe('RecommendationBadges', () => {
  it('should render', () => {
    expect(
      render(<RecommendationBadges {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should render code changes badge', () => {
    expect(
      render(<RecommendationBadges badges={['code_changes']} />),
    ).toBeTruthy()

    expect(
      screen.queryByTestId('recommendation-badge-code_changes'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('recommendation-badge-upgrade'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('recommendation-badge-configuration_changes'),
    ).not.toBeInTheDocument()
  })

  it('should render upgrade and configuration changes badges', () => {
    expect(
      render(
        <RecommendationBadges badges={['upgrade', 'configuration_changes']} />,
      ),
    ).toBeTruthy()

    expect(
      screen.queryByTestId('recommendation-badge-code_changes'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('recommendation-badge-upgrade'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('recommendation-badge-configuration_changes'),
    ).toBeInTheDocument()
  })
})
