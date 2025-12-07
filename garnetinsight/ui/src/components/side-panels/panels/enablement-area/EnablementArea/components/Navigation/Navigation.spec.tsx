import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import {
  MOCK_CUSTOM_TUTORIALS_ITEMS,
  MOCK_TUTORIALS_ITEMS,
} from 'uiSrc/constants'
import Navigation from './Navigation'

const guides = {
  tutorials: MOCK_TUTORIALS_ITEMS,
  customTutorials: MOCK_CUSTOM_TUTORIALS_ITEMS,
}

describe('Navigation', () => {
  it('should render', () => {
    expect(
      render(<Navigation {...guides} isInternalPageVisible />),
    ).toBeTruthy()
  })

  it('should render navigation groups', () => {
    render(<Navigation {...guides} isInternalPageVisible />)

    expect(screen.queryByTestId('accordion-tutorials')).toBeInTheDocument()
    expect(
      screen.queryByTestId('accordion-custom-tutorials'),
    ).toBeInTheDocument()
  })
})
