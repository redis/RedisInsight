import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { handleCopy } from 'uiSrc/utils'
import { vectorSetElementFactory } from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'
import { ElementDetails } from './ElementDetails'
import { ElementDetailsProps } from './ElementDetails.types'

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  handleCopy: jest.fn(),
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

  it('should exit edit mode when cancel is clicked', () => {
    renderComponent()
    fireEvent.click(screen.getByTestId('vector-set-edit-attributes-btn'))
    fireEvent.click(screen.getByTestId('vector-set-cancel-attributes-btn'))
    expect(
      screen.queryByTestId('vector-set-save-attributes-btn'),
    ).not.toBeInTheDocument()
  })

  it('should disable save when value is unchanged', () => {
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
