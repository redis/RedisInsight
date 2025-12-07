import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import AutodiscoveryPageTemplate from './AutodiscoveryPageTemplate'

jest.mock('uiSrc/slices/panels/sidePanels', () => ({
  ...jest.requireActual('uiSrc/slices/panels/sidePanels'),
  sidePanelsSelector: jest.fn().mockReturnValue({
    openedPanel: 'insights',
  }),
}))

describe('AutoDiscoveryPageTemplate', () => {
  it('should render', () => {
    expect(
      render(<AutodiscoveryPageTemplate>1</AutodiscoveryPageTemplate>),
    ).toBeTruthy()
  })

  it('should render children and side panel', () => {
    render(
      <AutodiscoveryPageTemplate>
        <div data-testid="children" />
      </AutodiscoveryPageTemplate>,
    )

    expect(screen.getByTestId('children')).toBeInTheDocument()
    expect(screen.getByTestId('side-panels-insights')).toBeInTheDocument()
  })
})
