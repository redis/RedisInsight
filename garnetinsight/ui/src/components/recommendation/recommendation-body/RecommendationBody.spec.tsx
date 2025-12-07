import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { IRecommendationContent } from 'uiSrc/slices/interfaces/recommendations'
import RecommendationBody, { Props } from './RecommendationBody'

const mockedProps = mock<Props>()

const mockContent: IRecommendationContent[] = [
  {
    type: 'unknown',
    value: 'unknown',
  },
]

const mockTelemetryName = 'name'

describe('RecommendationBody', () => {
  it('should render', () => {
    expect(
      render(<RecommendationBody {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should render element', () => {
    render(
      <RecommendationBody
        {...instance(mockedProps)}
        elements={mockContent}
        telemetryName={mockTelemetryName}
      />,
    )

    expect(screen.getByText('unknown')).toBeInTheDocument()
  })
})
