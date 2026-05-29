import React from 'react'
import { cloneDeep, set } from 'lodash'
import {
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import {
  FeatureFlags,
  MOCK_CUSTOM_TUTORIALS_ITEMS,
  MOCK_TUTORIALS_ITEMS,
} from 'uiSrc/constants'
import Navigation from './Navigation'

const guides = {
  tutorials: MOCK_TUTORIALS_ITEMS,
  customTutorials: MOCK_CUSTOM_TUTORIALS_ITEMS,
}

const renderWithCustomTutorialsEnabled = (ui: React.ReactElement) => {
  const initialStoreState = set(
    cloneDeep(initialStateDefault),
    `app.features.featureFlags.features.${FeatureFlags.customTutorials}`,
    { flag: true },
  )
  return render(ui, { store: mockStore(initialStoreState) })
}

describe('Navigation', () => {
  it('should render', () => {
    expect(
      render(<Navigation {...guides} isInternalPageVisible />),
    ).toBeTruthy()
  })

  it('should render navigation groups when customTutorials feature is on', () => {
    renderWithCustomTutorialsEnabled(
      <Navigation {...guides} isInternalPageVisible />,
    )

    expect(screen.queryByTestId('accordion-tutorials')).toBeInTheDocument()
    expect(
      screen.queryByTestId('accordion-custom-tutorials'),
    ).toBeInTheDocument()
  })

  it('should hide custom tutorials section when customTutorials feature is off', () => {
    render(<Navigation {...guides} isInternalPageVisible />)

    expect(screen.queryByTestId('accordion-tutorials')).toBeInTheDocument()
    expect(
      screen.queryByTestId('accordion-custom-tutorials'),
    ).not.toBeInTheDocument()
  })
})
