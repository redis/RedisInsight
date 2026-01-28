import React from 'react'
import { faker } from '@faker-js/faker'

import { render, screen, fireEvent, waitFor } from 'uiSrc/utils/test-utils'

import { CommandViewProps } from './CommandView.types'

jest.mock('react-monaco-editor', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: (props: any) =>
      React.createElement(
        'div',
        {
          'data-testid': props['data-testid'],
          'data-language': props.language,
          'data-theme': props.theme,
          'data-readonly': props.options?.readOnly,
          'data-linenumbers': props.options?.lineNumbers,
        },
        props.value,
      ),
    monaco: {
      editor: {},
      languages: {},
    },
  }
})

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  handleCopy: jest.fn(),
}))

import { handleCopy } from 'uiSrc/utils'
import { CommandView } from './CommandView'

const mockedHandleCopy = jest.mocked(handleCopy)

describe('CommandView', () => {
  const defaultProps: CommandViewProps = {
    command: 'FT.CREATE idx:test ON HASH SCHEMA field TEXT',
  }

  const renderComponent = (propsOverride?: Partial<CommandViewProps>) => {
    const props = { ...defaultProps, ...propsOverride }

    return render(<CommandView {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render component with command and copy button', () => {
    const command = faker.lorem.sentence()
    renderComponent({ command })

    const editor = screen.getByTestId('command-view--editor')
    expect(editor).toBeInTheDocument()
    expect(editor).toHaveTextContent(command)
    expect(editor).toHaveAttribute('data-readonly', 'true')

    const copyButton = screen.getByTestId('command-view--copy-button-btn')
    expect(copyButton).toBeInTheDocument()
  })

  it('should copy command to clipboard and call onCopy callback when copy button is clicked', async () => {
    const command = faker.lorem.sentence()
    const onCopyMock = jest.fn()

    renderComponent({ command, onCopy: onCopyMock })

    const copyButton = screen.getByTestId('command-view--copy-button-btn')
    fireEvent.click(copyButton)

    expect(mockedHandleCopy).toHaveBeenCalledWith(command)
    await waitFor(() => {
      expect(onCopyMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('language prop', () => {
    it('should use default Redis language when not provided', () => {
      renderComponent()

      const editor = screen.getByTestId('command-view--editor')
      expect(editor).toHaveAttribute('data-language', 'redisLanguage')
    })

    it('should use custom language when provided', () => {
      const customLanguage = 'plaintext'
      renderComponent({ language: customLanguage })

      const editor = screen.getByTestId('command-view--editor')
      expect(editor).toHaveAttribute('data-language', customLanguage)
    })
  })

  it('should apply custom className', () => {
    const customClassName = `test-${faker.string.alphanumeric(10)}`
    const { container } = renderComponent({ className: customClassName })

    const commandView = container.firstChild
    expect(commandView).toHaveClass(customClassName)
  })

  it('should use custom data-testid when provided', () => {
    const customTestId = faker.string.alphanumeric(10)
    renderComponent({ dataTestId: customTestId })

    const commandView = screen.getByTestId(customTestId)
    expect(commandView).toBeInTheDocument()

    const editor = screen.getByTestId(`${customTestId}--editor`)
    expect(editor).toBeInTheDocument()

    const copyButton = screen.getByTestId(`${customTestId}--copy-button-btn`)
    expect(copyButton).toBeInTheDocument()
  })

  describe('showLineNumbers prop', () => {
    it('should hide line numbers by default', () => {
      renderComponent()

      const editor = screen.getByTestId('command-view--editor')
      expect(editor).toHaveAttribute('data-linenumbers', 'off')
    })

    it('should show line numbers when set to true', () => {
      renderComponent({ showLineNumbers: true })

      const editor = screen.getByTestId('command-view--editor')
      expect(editor).toHaveAttribute('data-linenumbers', 'on')
    })
  })
})
