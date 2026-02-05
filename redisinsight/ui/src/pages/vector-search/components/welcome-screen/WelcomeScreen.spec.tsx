import React from 'react'
import { act } from '@testing-library/react'
import {
  fireEvent,
  render,
  screen,
  waitForRiTooltipVisible,
} from 'uiSrc/utils/test-utils'

import { WelcomeScreen } from './WelcomeScreen'
import type { WelcomeScreenProps } from './WelcomeScreen.types'
import { TITLE, SUBTITLE, FEATURES } from './WelcomeScreen.constants'

const defaultProps: WelcomeScreenProps = {
  onTrySampleDataClick: jest.fn(),
  onUseMyDatabaseClick: jest.fn(),
}

const renderComponent = (props: Partial<WelcomeScreenProps> = {}) =>
  render(<WelcomeScreen {...defaultProps} {...props} />)

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all sections', () => {
    renderComponent()

    const welcomeScreen = screen.getByTestId('welcome-screen')
    expect(welcomeScreen).toBeInTheDocument()

    const title = screen.getByTestId('welcome-screen--title')
    expect(title).toHaveTextContent(TITLE)

    const subtitle = screen.getByTestId('welcome-screen--subtitle')
    expect(subtitle).toHaveTextContent(SUBTITLE)

    const features = screen.getByTestId('welcome-screen--features')
    expect(features).toBeInTheDocument()

    FEATURES.forEach((feature) => {
      const featureTitle = screen.getByText(feature.title)
      expect(featureTitle).toBeInTheDocument()
    })

    const trySampleDataBtn = screen.getByTestId(
      'welcome-screen--try-sample-data-btn',
    )
    expect(trySampleDataBtn).toBeInTheDocument()

    const useMyDatabaseBtn = screen.getByTestId(
      'welcome-screen--use-my-database-btn',
    )
    expect(useMyDatabaseBtn).toBeInTheDocument()

    const background = screen.getByTestId('welcome-screen--background')
    expect(background).toBeInTheDocument()
  })

  it('should call onTrySampleDataClick when primary button is clicked', () => {
    const onTrySampleDataClick = jest.fn()
    renderComponent({ onTrySampleDataClick })

    const trySampleDataBtn = screen.getByTestId(
      'welcome-screen--try-sample-data-btn',
    )
    fireEvent.click(trySampleDataBtn)

    expect(onTrySampleDataClick).toHaveBeenCalledTimes(1)
  })

  it('should call onUseMyDatabaseClick when secondary button is clicked', () => {
    const onUseMyDatabaseClick = jest.fn()
    renderComponent({ onUseMyDatabaseClick })

    const useMyDatabaseBtn = screen.getByTestId(
      'welcome-screen--use-my-database-btn',
    )
    fireEvent.click(useMyDatabaseBtn)

    expect(onUseMyDatabaseClick).toHaveBeenCalledTimes(1)
  })

  it('should disable secondary button when useMyDatabaseDisabled is provided', async () => {
    const onUseMyDatabaseClick = jest.fn()
    renderComponent({
      onUseMyDatabaseClick,
      useMyDatabaseDisabled: { tooltip: 'Feature disabled' },
    })

    const button = screen.getByTestId('welcome-screen--use-my-database-btn')
    expect(button).toBeDisabled()

    fireEvent.click(button)
    expect(onUseMyDatabaseClick).not.toHaveBeenCalled()

    await act(async () => {
      fireEvent.focus(button)
    })
    await waitForRiTooltipVisible()

    const tooltipText = screen.getAllByText('Feature disabled')[0]
    expect(tooltipText).toBeInTheDocument()
  })
})
