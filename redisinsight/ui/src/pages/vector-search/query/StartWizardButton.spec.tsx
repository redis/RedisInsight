import React from 'react'
import { cleanup, render, screen, userEvent } from 'uiSrc/utils/test-utils'
import { StartWizardButton } from './StartWizardButton'
import useStartWizard from '../hooks/useStartWizard'

jest.mock('../hooks/useStartWizard', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const renderComponent = () => render(<StartWizardButton />)
const mockedUseStartWizard = useStartWizard as jest.Mock

describe('StartWizardButton', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('renders the CTA and calls the start function on click', async () => {
    const startMock = jest.fn()
    mockedUseStartWizard.mockReturnValue(startMock)

    renderComponent()

    expect(
      screen.getByText(
        'Power fast, real-time semantic AI search with vector search.',
      ),
    ).toBeInTheDocument()

    const btn = screen.getByRole('button', { name: /get started/i })
    expect(btn).toBeInTheDocument()

    await userEvent.click(btn)
    expect(startMock).toHaveBeenCalledTimes(1)
  })
})
