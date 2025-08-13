import React from 'react'

import { render, screen, userEvent } from 'uiSrc/utils/test-utils'
import ChangeEditorTypeButton from './ChangeEditorTypeButton'

const mockSwitchEditorType = jest.fn()
let mockIsTextEditorDisabled = false

jest.mock('./useChangeEditorType', () => ({
  useChangeEditorType: () => ({
    switchEditorType: mockSwitchEditorType,
    isTextEditorDisabled: mockIsTextEditorDisabled,
  }),
}))

describe('ChangeEditorTypeButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render an enabled button with default tooltip', async () => {
    mockIsTextEditorDisabled = false

    render(<ChangeEditorTypeButton />)

    const button = screen.getByRole('button', { name: /change editor type/i })
    expect(button).toBeEnabled()

    await userEvent.hover(button)
    expect(
      (await screen.findAllByText('Edit value in text editor'))[0],
    ).toBeInTheDocument()
  })

  it('should render a disabled button with a tooltip', async () => {
    mockIsTextEditorDisabled = true

    render(<ChangeEditorTypeButton />)

    const button = screen.getByRole('button', { name: /change editor type/i })
    expect(button).toBeDisabled()

    await userEvent.hover(button)
    expect(
      (
        await screen.findAllByText(
          'This JSON document is too large to view or edit in full.',
        )
      )[0],
    ).toBeInTheDocument()
  })

  it('should call switchEditorType on click when not disabled', async () => {
    mockIsTextEditorDisabled = false

    render(<ChangeEditorTypeButton />)

    const button = screen.getByRole('button', { name: /change editor type/i })
    await userEvent.click(button)

    expect(mockSwitchEditorType).toHaveBeenCalled()
  })

  it('should not call switchEditorType when disabled', async () => {
    mockIsTextEditorDisabled = true

    render(<ChangeEditorTypeButton />)

    const button = screen.getByRole('button', { name: /change editor type/i })
    await userEvent.click(button)

    expect(mockSwitchEditorType).not.toHaveBeenCalled()
  })
})
