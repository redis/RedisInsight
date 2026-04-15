import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { handleCopy } from 'uiSrc/utils'
import { setVectorSetElementAttribute } from 'uiSrc/slices/browser/vectorSet'
import { vectorSetElementFactory } from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'
import { ElementDetails } from './ElementDetails'
import { ElementDetailsProps } from './ElementDetails.types'

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  handleCopy: jest.fn(),
}))

const mockUseMonacoValidation = jest.fn().mockReturnValue({
  isValid: true,
  isValidating: false,
})

jest.mock('uiSrc/components/base/code-editor', () => ({
  CodeEditor: (props: any) => {
    const mockReact = require('react')
    return mockReact.createElement('textarea', {
      'data-testid': 'mock-monaco-editor',
      value: props.value,
      readOnly: props.options?.readOnly,
      onChange: (e: any) => {
        if (props.onChange) props.onChange(e.target.value)
      },
    })
  },
}))

jest.mock('uiSrc/components/monaco-editor', () => ({
  useMonacoValidation: (...args: any[]) => mockUseMonacoValidation(...args),
}))

jest.mock('uiSrc/slices/browser/vectorSet', () => ({
  ...jest.requireActual('uiSrc/slices/browser/vectorSet'),
  setVectorSetElementAttribute: jest.fn(() => jest.fn()),
  fetchDownloadVectorEmbedding: jest.fn(() => jest.fn()),
}))

const mockElement = vectorSetElementFactory.build()

const defaultProps: ElementDetailsProps = {
  element: mockElement,
  isOpen: true,
  onClose: jest.fn(),
  onDrawerDidClose: jest.fn(),
}

describe('ElementDetails', () => {
  const renderComponent = (propsOverride?: Partial<ElementDetailsProps>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<ElementDetails {...props} />)
  }

  beforeEach(() => {
    jest.mocked(setVectorSetElementAttribute).mockClear()
    mockUseMonacoValidation.mockReturnValue({
      isValid: true,
      isValidating: false,
    })
  })

  it('should render when open with element', () => {
    renderComponent()
    expect(screen.getByTestId('vector-set-vector-value')).toBeInTheDocument()
  })

  it('should display vector values in read-only textarea', () => {
    renderComponent()
    const vectorField = screen.getByTestId('vector-set-vector-value')
    const expectedVector = `[${mockElement.vector!.join(', ')}]`
    expect(vectorField).toHaveTextContent(expectedVector)
    expect(vectorField).toHaveAttribute('readonly')
  })

  it('should display formatted attributes in editor', () => {
    renderComponent()
    const editor = screen.getByTestId(
      'mock-monaco-editor',
    ) as HTMLTextAreaElement
    if (mockElement.attributes) {
      const parsed = JSON.parse(mockElement.attributes)
      Object.keys(parsed).forEach((key) => {
        expect(editor.value).toContain(key)
      })
    }
  })

  it('should enter edit mode when edit button is clicked', () => {
    renderComponent()
    fireEvent.click(screen.getByTestId('vector-set-edit-attributes-btn'))
    expect(
      screen.getByTestId('vector-set-save-attributes-btn'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('vector-set-cancel-attributes-btn'),
    ).toBeInTheDocument()
  })

  it('should revert changes when cancel is clicked', () => {
    const element = vectorSetElementFactory.build({
      attributes: JSON.stringify({ status: 'original' }),
    })
    renderComponent({ element })

    const editor = screen.getByTestId(
      'mock-monaco-editor',
    ) as HTMLTextAreaElement
    const originalValue = editor.value

    fireEvent.click(screen.getByTestId('vector-set-edit-attributes-btn'))
    fireEvent.change(editor, {
      target: { value: '{"status": "modified"}' },
    })
    expect(editor.value).toBe('{"status": "modified"}')

    fireEvent.click(screen.getByTestId('vector-set-cancel-attributes-btn'))

    expect(editor.value).toBe(originalValue)
    expect(
      screen.queryByTestId('vector-set-save-attributes-btn'),
    ).not.toBeInTheDocument()
  })

  it('should call setVectorSetElementAttribute on save', () => {
    renderComponent()
    fireEvent.click(screen.getByTestId('vector-set-edit-attributes-btn'))

    const editor = screen.getByTestId(
      'mock-monaco-editor',
    ) as HTMLTextAreaElement
    fireEvent.change(editor, { target: { value: '{"changed": true}' } })

    fireEvent.click(screen.getByTestId('vector-set-save-attributes-btn'))
    expect(setVectorSetElementAttribute).toHaveBeenCalledTimes(1)
  })

  it('should disable save when validation reports invalid', () => {
    mockUseMonacoValidation.mockReturnValue({
      isValid: false,
      isValidating: false,
    })
    renderComponent()
    fireEvent.click(screen.getByTestId('vector-set-edit-attributes-btn'))

    const saveBtn = screen.getByTestId('vector-set-save-attributes-btn')
    expect(saveBtn).toBeDisabled()
  })

  it('should show copy button for small vectors and copy on click', () => {
    renderComponent()
    expect(
      screen.getByTestId('vector-set-copy-vector-btn-btn'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('vector-set-download-vector-btn'),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('vector-set-copy-vector-btn-btn'))

    const expectedVector = `[${mockElement.vector!.join(', ')}]`
    expect(handleCopy).toHaveBeenCalledWith(expectedVector)
  })

  it('should show download button instead of copy for truncated vectors', () => {
    const truncatedElement = vectorSetElementFactory.build({
      vectorTruncated: true,
    })
    renderComponent({ element: truncatedElement })

    expect(
      screen.getByTestId('vector-set-download-vector-btn'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('vector-set-copy-vector-btn-btn'),
    ).not.toBeInTheDocument()
  })
})
