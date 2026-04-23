import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { addVectorSetKey } from 'uiSrc/slices/browser/keys'
import { stringToBuffer } from 'uiSrc/utils'
import { FP32_VECTOR_FIXTURE_1_2_3 } from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'
import AddKeyVectorSet from './AddKeyVectorSet'
import { Props } from './AddKeyVectorSet.types'

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  addVectorSetKey: jest.fn(() => ({ type: 'keys/addVectorSetKey' })),
}))

const defaultProps: Props = {
  keyName: 'myVectorSet',
  keyTTL: undefined,
  onCancel: jest.fn(),
}

describe('AddKeyVectorSet', () => {
  const renderComponent = (propsOverride?: Partial<Props>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<AddKeyVectorSet {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // ActionFooter renders via a portal to #formFooterBar
    const footer = document.createElement('div')
    footer.setAttribute('id', 'formFooterBar')
    document.body.appendChild(footer)
  })

  afterEach(() => {
    const footer = document.getElementById('formFooterBar')
    footer?.remove()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render the populate mode radio group with manual pre-selected', () => {
    renderComponent()
    expect(
      screen.getByTestId('add-key-vector-set-populate'),
    ).toBeInTheDocument()
  })

  it('should render element name and vector inputs', () => {
    renderComponent()
    expect(screen.getByTestId('element-name')).toBeInTheDocument()
    expect(screen.getByTestId('element-vector')).toBeInTheDocument()
  })

  it('should disable the submit button when the form is invalid', () => {
    renderComponent()
    expect(screen.getByTestId('add-key-vector-set-btn')).toBeDisabled()
  })

  it('should enable the submit button once name and a valid vector are entered', () => {
    renderComponent()

    fireEvent.change(screen.getByTestId('element-name'), {
      target: { value: 'elem1' },
    })
    fireEvent.change(screen.getByTestId('element-vector'), {
      target: { value: '0.1, 0.2, 0.3' },
    })

    expect(screen.getByTestId('add-key-vector-set-btn')).not.toBeDisabled()
  })

  it('should dispatch addVectorSetKey with parsed elements on submit', () => {
    renderComponent()

    fireEvent.change(screen.getByTestId('element-name'), {
      target: { value: 'elem1' },
    })
    fireEvent.change(screen.getByTestId('element-vector'), {
      target: { value: '1, 2, 3' },
    })
    fireEvent.click(screen.getByTestId('add-key-vector-set-btn'))

    expect(addVectorSetKey).toHaveBeenCalledWith(
      expect.objectContaining({
        elements: [{ name: stringToBuffer('elem1'), vectorValues: [1, 2, 3] }],
      }),
      expect.any(Function),
    )
  })

  it('should dispatch addVectorSetKey with vectorFp32 base64 when an FP32 input is entered', () => {
    renderComponent()

    const { escaped: fp32Escaped, base64: expectedBase64 } =
      FP32_VECTOR_FIXTURE_1_2_3

    fireEvent.change(screen.getByTestId('element-name'), {
      target: { value: 'elem1' },
    })
    fireEvent.change(screen.getByTestId('element-vector'), {
      target: { value: fp32Escaped },
    })
    fireEvent.click(screen.getByTestId('add-key-vector-set-btn'))

    expect(addVectorSetKey).toHaveBeenCalledWith(
      expect.objectContaining({
        elements: [
          { name: stringToBuffer('elem1'), vectorFp32: expectedBase64 },
        ],
      }),
      expect.any(Function),
    )
  })

  it('should include expire in payload when keyTTL is provided', () => {
    renderComponent({ keyTTL: 60 })

    fireEvent.change(screen.getByTestId('element-name'), {
      target: { value: 'elem1' },
    })
    fireEvent.change(screen.getByTestId('element-vector'), {
      target: { value: '1, 2, 3' },
    })
    fireEvent.click(screen.getByTestId('add-key-vector-set-btn'))

    expect(addVectorSetKey).toHaveBeenCalledWith(
      expect.objectContaining({ expire: 60 }),
      expect.any(Function),
    )
  })

  it('should call onCancel when the cancel button is clicked', () => {
    const onCancel = jest.fn()
    renderComponent({ onCancel })

    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledWith(true)
  })
})
