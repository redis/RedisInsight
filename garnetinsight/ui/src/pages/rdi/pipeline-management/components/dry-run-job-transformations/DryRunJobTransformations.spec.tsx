import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { rdiDryRunJobSelector } from 'uiSrc/slices/rdi/dryRun'
import DryRunJobTransformations from './DryRunJobTransformations'

jest.mock('uiSrc/slices/rdi/dryRun', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/dryRun'),
  rdiDryRunJobSelector: jest.fn().mockReturnValue({
    results: null,
  }),
}))

describe('DryRunJobTransformations', () => {
  it('should render', () => {
    expect(render(<DryRunJobTransformations />)).toBeTruthy()
  })

  it('should render no transformation message', () => {
    const rdiDryRunJobSelectorMock = jest.fn().mockReturnValue({
      results: {},
    })
    ;(rdiDryRunJobSelector as jest.Mock).mockImplementationOnce(
      rdiDryRunJobSelectorMock,
    )

    render(<DryRunJobTransformations />)
    expect(screen.getByTestId('transformations-output')).toHaveTextContent(
      'No transformation results provided by the server.',
    )
  })

  it('should render transformations', () => {
    const rdiDryRunJobSelectorMock = jest.fn().mockReturnValue({
      results: { transformation: [] },
    })
    ;(rdiDryRunJobSelector as jest.Mock).mockImplementationOnce(
      rdiDryRunJobSelectorMock,
    )

    render(<DryRunJobTransformations />)
    expect(screen.getByTestId('transformations-output')).toHaveTextContent('[]')
  })
})
