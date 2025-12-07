import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import CodeBlock from './CodeBlock'

const originalClipboard = { ...global.navigator.clipboard }
describe('CodeBlock', () => {
  beforeEach(() => {
    // @ts-ignore
    global.navigator.clipboard = {
      writeText: jest.fn(),
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
    // @ts-ignore
    global.navigator.clipboard = originalClipboard
  })

  it('should render', () => {
    expect(render(<CodeBlock>text</CodeBlock>)).toBeTruthy()
  })

  it('should render proper content', () => {
    render(<CodeBlock data-testid="code">text</CodeBlock>)
    expect(screen.getByTestId('code')).toHaveTextContent('text')
  })

  it('should not render copy button by default', () => {
    render(<CodeBlock data-testid="code">text</CodeBlock>)
    expect(screen.queryByTestId('copy-code-btn')).not.toBeInTheDocument()
  })

  it('should copy proper text', () => {
    render(
      <CodeBlock data-testid="code" isCopyable>
        text
      </CodeBlock>,
    )
    fireEvent.click(screen.getByTestId('copy-code-btn'))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('text')
  })

  it('should copy proper text when children is ReactNode', () => {
    render(
      <CodeBlock data-testid="code" isCopyable>
        <span>text2</span>
      </CodeBlock>,
    )
    fireEvent.click(screen.getByTestId('copy-code-btn'))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('text2')
  })
})
