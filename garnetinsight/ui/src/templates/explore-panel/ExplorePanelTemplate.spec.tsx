import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import ExplorePanelTemplate from './ExplorePanelTemplate'

jest.mock('uiSrc/slices/panels/sidePanels', () => ({
  ...jest.requireActual('uiSrc/slices/panels/sidePanels'),
  sidePanelsSelector: jest.fn().mockReturnValue({
    openedPanel: 'insights',
  }),
}))

describe('ExplorePanelTemplate', () => {
  it('should render', () => {
    expect(
      render(
        <ExplorePanelTemplate>
          <div />
        </ExplorePanelTemplate>,
      ),
    ).toBeTruthy()
  })

  it('should render children and insights panel', () => {
    render(
      <ExplorePanelTemplate>
        <div data-testid="children" />
      </ExplorePanelTemplate>,
    )

    expect(screen.getByTestId('children')).toBeInTheDocument()
    expect(screen.getByTestId('side-panels-insights')).toBeInTheDocument()
  })
})
