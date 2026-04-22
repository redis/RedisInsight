import React from 'react'
import { cloneDeep } from 'lodash'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { addVectorSetKey } from 'uiSrc/slices/browser/keys'
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
    expect(render(<AddKeyVectorSet {...defaultProps} />)).toBeTruthy()
  })

  it('should render the populate mode radio group with manual pre-selected', () => {
    render(<AddKeyVectorSet {...defaultProps} />)
    expect(
      screen.getByTestId('add-key-vector-set-populate'),
    ).toBeInTheDocument()
  })

  it('should render element name and vector inputs', () => {
    render(<AddKeyVectorSet {...defaultProps} />)
    expect(screen.getByTestId('element-name')).toBeInTheDocument()
    expect(screen.getByTestId('element-vector')).toBeInTheDocument()
  })

  it('should disable the submit button when the form is invalid', () => {
    render(<AddKeyVectorSet {...defaultProps} />)
    expect(screen.getByTestId('add-key-vector-set-btn')).toBeDisabled()
  })

  it('should enable the submit button once name and a valid vector are entered', () => {
    render(<AddKeyVectorSet {...cloneDeep(defaultProps)} />)

    fireEvent.change(screen.getByTestId('element-name'), {
      target: { value: 'elem1' },
    })
    fireEvent.change(screen.getByTestId('element-vector'), {
      target: { value: '0.1, 0.2, 0.3' },
    })

    expect(screen.getByTestId('add-key-vector-set-btn')).not.toBeDisabled()
  })

  it('should dispatch addVectorSetKey with parsed elements on submit', () => {
    render(<AddKeyVectorSet {...cloneDeep(defaultProps)} />)

    fireEvent.change(screen.getByTestId('element-name'), {
      target: { value: 'elem1' },
    })
    fireEvent.change(screen.getByTestId('element-vector'), {
      target: { value: '1, 2, 3' },
    })
    fireEvent.click(screen.getByTestId('add-key-vector-set-btn'))

    expect(addVectorSetKey).toHaveBeenCalledWith(
      expect.objectContaining({
        elements: [{ name: 'elem1', vector: [1, 2, 3] }],
      }),
      expect.any(Function),
    )
  })

  it('should include expire in payload when keyTTL is provided', () => {
    render(<AddKeyVectorSet {...cloneDeep(defaultProps)} keyTTL={60} />)

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
    render(<AddKeyVectorSet {...defaultProps} onCancel={onCancel} />)

    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledWith(true)
  })
})
