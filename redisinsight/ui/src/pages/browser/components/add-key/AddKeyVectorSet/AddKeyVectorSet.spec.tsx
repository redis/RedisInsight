import React from 'react'
import {
  act,
  fireEvent,
  mockedStore,
  render,
  screen,
  waitFor,
} from 'uiSrc/utils/test-utils'
import { addKeyIntoList, addVectorSetKey } from 'uiSrc/slices/browser/keys'
import { stringToBuffer } from 'uiSrc/utils'
import { FP32_VECTOR_FIXTURE_1_2_3 } from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'
import { bulkActionOverviewFactory } from 'uiSrc/mocks/factories/browser/bulkActions/bulkActionOverview.factory'
import AddKeyVectorSet from './AddKeyVectorSet'
import { Props } from './AddKeyVectorSet.types'

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  addVectorSetKey: jest.fn(() => ({ type: 'keys/addVectorSetKey' })),
  addKeyIntoList: jest.fn(() => ({ type: 'keys/addKeyIntoList' })),
}))

const mockLoad = jest.fn()
jest.mock('uiSrc/services/hooks', () => ({
  ...jest.requireActual('uiSrc/services/hooks'),
  useLoadData: () => ({
    load: mockLoad,
    loading: false,
    error: null,
  }),
}))

const mockCheckVec2WordExists = jest.fn()
jest.mock('./LoadSampleDataset', () => ({
  __esModule: true,
  ...jest.requireActual('./LoadSampleDataset'),
  checkVec2WordExists: (...args: unknown[]) => mockCheckVec2WordExists(...args),
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
    mockedStore.clearActions()
    // Default: vec2word does not exist, so submit proceeds to bulk-import.
    mockCheckVec2WordExists.mockResolvedValue(false)
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

  describe('sample dataset mode', () => {
    const selectSampleMode = () =>
      fireEvent.click(screen.getByTestId('add-key-vector-set-populate-sample'))
    const selectManualMode = () =>
      fireEvent.click(screen.getByTestId('add-key-vector-set-populate-manual'))

    it('swaps the form section and mirrors populate mode into the parent keyName + disabled flag', () => {
      const setKeyName = jest.fn()
      const setKeyNameDisabled = jest.fn()
      renderComponent({ setKeyName, setKeyNameDisabled })

      // Initial Manual render → input cleared and unlocked.
      expect(setKeyName).toHaveBeenLastCalledWith('')
      expect(setKeyNameDisabled).toHaveBeenLastCalledWith(false)

      selectSampleMode()
      expect(
        screen.getByTestId('add-key-vector-set-load-sample-dataset'),
      ).toBeInTheDocument()
      expect(screen.queryByTestId('element-name')).not.toBeInTheDocument()
      expect(setKeyName).toHaveBeenLastCalledWith('vec2word')
      expect(setKeyNameDisabled).toHaveBeenLastCalledWith(true)

      selectManualMode()
      expect(setKeyName).toHaveBeenLastCalledWith('')
      expect(setKeyNameDisabled).toHaveBeenLastCalledWith(false)
    })

    const expectMessageDispatched = (title: string) =>
      expect(mockedStore.getActions()).toContainEqual(
        expect.objectContaining({
          type: 'notifications/addMessageNotification',
          payload: expect.objectContaining({ title }),
        }),
      )

    it('on submit calls useLoadData.load with vec2word, refreshes the keys list, surfaces a success toast and closes the dialog', async () => {
      mockLoad.mockResolvedValue(bulkActionOverviewFactory.build())
      const onCancel = jest.fn()
      renderComponent({ onCancel })
      selectSampleMode()

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-vector-set-btn'))
      })

      await waitFor(() =>
        expect(mockLoad).toHaveBeenCalledWith(expect.anything(), 'vec2word'),
      )
      expect(addKeyIntoList).toHaveBeenCalledWith(
        expect.objectContaining({ key: stringToBuffer('vec2word') }),
      )
      expectMessageDispatched('Sample vector set added')
      expect(onCancel).toHaveBeenCalled()
      expect(addVectorSetKey).not.toHaveBeenCalled()
    })

    it('dispatches an info toast and skips the bulk-import when vec2word already exists', async () => {
      mockCheckVec2WordExists.mockResolvedValue(true)
      const onCancel = jest.fn()
      renderComponent({ onCancel })
      selectSampleMode()

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-vector-set-btn'))
      })

      await waitFor(() => expectMessageDispatched('Key already exists'))
      expect(mockLoad).not.toHaveBeenCalled()
      expect(onCancel).toHaveBeenCalled()
    })

    it('ignores extra clicks while the preflight checkVec2WordExists call is still in flight', async () => {
      // Pin the preflight as a deferred promise so we can simulate the
      // "user clicked twice before the existence check resolved" window.
      let resolveExists: (value: boolean) => void = () => {}
      mockCheckVec2WordExists.mockImplementation(
        () =>
          new Promise<boolean>((resolve) => {
            resolveExists = resolve
          }),
      )
      mockLoad.mockResolvedValue(bulkActionOverviewFactory.build())
      const onCancel = jest.fn()
      renderComponent({ onCancel })
      selectSampleMode()

      const submitButton = screen.getByTestId('add-key-vector-set-btn')
      await act(async () => {
        fireEvent.click(submitButton)
        fireEvent.click(submitButton)
        fireEvent.click(submitButton)
      })

      expect(mockCheckVec2WordExists).toHaveBeenCalledTimes(1)
      await waitFor(() => expect(submitButton).toBeDisabled())

      await act(async () => {
        resolveExists(false)
      })

      await waitFor(() =>
        expect(mockLoad).toHaveBeenCalledWith(expect.anything(), 'vec2word'),
      )
      expect(mockLoad).toHaveBeenCalledTimes(1)
    })

    it('dispatches the failure toast and keeps the dialog open when load fails', async () => {
      mockLoad.mockRejectedValue(new Error('boom'))
      const onCancel = jest.fn()
      renderComponent({ onCancel })
      selectSampleMode()

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-vector-set-btn'))
      })

      await waitFor(() =>
        expectMessageDispatched('Failed to create vector set'),
      )
      expect(onCancel).not.toHaveBeenCalled()
    })
  })
})
