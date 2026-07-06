import React from 'react'
import {
  act,
  fireEvent,
  initialStateDefault,
  mockStore,
  render,
  screen,
  waitFor,
} from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'
import { stringToBuffer } from 'uiSrc/utils'

import { ArrayAddForm } from './ArrayAddForm'

// Capture the confirmation callback so a test can defer/replay it (the real
// modal outlives the panel). By default it fires immediately, matching the
// non-production provider the other tests rely on.
let capturedOnConfirm: (() => void) | undefined
const mockRequestConfirmation = jest.fn(
  ({ onConfirm }: { onConfirm: () => void }) => {
    capturedOnConfirm = onConfirm
    onConfirm()
  },
)
jest.mock('uiSrc/components/production-write-confirmation', () => ({
  ...jest.requireActual('uiSrc/components/production-write-confirmation'),
  useProductionWriteConfirmation: () => ({
    requestConfirmation: mockRequestConfirmation,
  }),
}))

const keyBuffer = stringToBuffer('mykey')

// The form reads the write key from the selected key's data (selectedKeyData),
// and applyArrayWriteResult gates the success side effects (onSuccess/
// closePanel) on the live browser-context selection — seed both to the key.
const stateWithKeySelected = {
  ...initialStateDefault,
  browser: {
    ...initialStateDefault.browser,
    keys: {
      ...initialStateDefault.browser.keys,
      selectedKey: {
        ...initialStateDefault.browser.keys.selectedKey,
        data: { name: keyBuffer } as any,
      },
    },
  },
  app: {
    ...initialStateDefault.app,
    context: {
      ...initialStateDefault.app.context,
      browser: {
        ...initialStateDefault.app.context.browser,
        keyList: {
          ...initialStateDefault.app.context.browser.keyList,
          selectedKey: keyBuffer,
        },
      },
    },
  },
}

const renderForm = (closePanel = jest.fn(), onReveal = jest.fn()) =>
  render(<ArrayAddForm closePanel={closePanel} onReveal={onReveal} />, {
    store: mockStore(stateWithKeySelected),
  })

const findCall = (fragment: string) =>
  (apiService.post as jest.Mock).mock.calls.find(([url]) =>
    (url as string).includes(fragment),
  )

describe('ArrayAddForm', () => {
  beforeEach(() => {
    apiService.post = jest.fn().mockResolvedValue({ status: 200, data: {} })
  })

  it('renders the value and index inputs', () => {
    renderForm()
    expect(screen.getByTestId('array-add-form-value')).toBeInTheDocument()
    expect(screen.getByTestId('array-add-form-index')).toBeInTheDocument()
  })

  it('disables the submit button while refresh is locked (write in flight or a cell editor open)', () => {
    const lockedState = {
      ...stateWithKeySelected,
      browser: {
        ...stateWithKeySelected.browser,
        keys: {
          ...stateWithKeySelected.browser.keys,
          selectedKey: {
            ...stateWithKeySelected.browser.keys.selectedKey,
            isRefreshDisabled: true,
          },
        },
      },
    }
    render(<ArrayAddForm closePanel={jest.fn()} />, {
      store: mockStore(lockedState),
    })

    expect(screen.getByTestId('array-add-form-submit')).toBeDisabled()
  })

  it('renders the move-to-element checkbox with an info tooltip', () => {
    renderForm()
    expect(
      screen.getByTestId('array-add-form-move-to-element'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('array-add-form-move-to-element-info'),
    ).toBeInTheDocument()
  })

  it('appends (POST /array/append) when the index is left empty', async () => {
    const closePanel = jest.fn()
    renderForm(closePanel)

    fireEvent.change(screen.getByTestId('array-add-form-value'), {
      target: { value: 'hello' },
    })
    fireEvent.click(screen.getByTestId('array-add-form-submit'))

    await waitFor(() => {
      expect(findCall('array/append')).toBeTruthy()
    })
    expect(findCall('array/set-element')).toBeFalsy()
    expect(closePanel).toHaveBeenCalled()
  })

  it('reveals the added element on success when "move to element" is checked', async () => {
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { index: '42' } })
    const onReveal = jest.fn()
    renderForm(jest.fn(), onReveal)

    fireEvent.change(screen.getByTestId('array-add-form-value'), {
      target: { value: 'hello' },
    })
    fireEvent.click(screen.getByTestId('array-add-form-submit'))

    await waitFor(() => expect(onReveal).toHaveBeenCalledWith('42'))
  })

  it('does not reveal when "move to element" is unchecked', async () => {
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { index: '42' } })
    const onReveal = jest.fn()
    renderForm(jest.fn(), onReveal)

    fireEvent.click(screen.getByTestId('array-add-form-move-to-element'))
    fireEvent.change(screen.getByTestId('array-add-form-value'), {
      target: { value: 'hello' },
    })
    fireEvent.click(screen.getByTestId('array-add-form-submit'))

    await waitFor(() => expect(findCall('array/append')).toBeTruthy())
    expect(onReveal).not.toHaveBeenCalled()
  })

  it('honors a "move to element" toggle made while the write is in flight', async () => {
    let resolvePost: (value: unknown) => void = () => {}
    apiService.post = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve
        }),
    )
    const onReveal = jest.fn()
    renderForm(jest.fn(), onReveal)

    fireEvent.change(screen.getByTestId('array-add-form-value'), {
      target: { value: 'hello' },
    })
    fireEvent.click(screen.getByTestId('array-add-form-submit'))

    // User unchecks the box before the POST resolves — the success handler must
    // read the live flag, not the value captured when Add was confirmed.
    fireEvent.click(screen.getByTestId('array-add-form-move-to-element'))
    await act(async () => {
      resolvePost({ status: 200, data: { index: '42' } })
    })

    expect(onReveal).not.toHaveBeenCalled()
  })

  it('does not close the panel if the form unmounted before the write resolved', async () => {
    // Hold the write open so we can unmount (key switch + fresh panel) first.
    let resolvePost: (value: unknown) => void = () => {}
    apiService.post = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve
        }),
    )
    const closePanel = jest.fn()
    const { unmount } = renderForm(closePanel)

    fireEvent.change(screen.getByTestId('array-add-form-value'), {
      target: { value: 'hello' },
    })
    fireEvent.click(screen.getByTestId('array-add-form-submit'))

    unmount()
    await act(async () => {
      resolvePost({ status: 200, data: {} })
    })

    // The stale success callback must not close the now-current panel.
    expect(closePanel).not.toHaveBeenCalled()
  })

  it('does not write from a discarded panel when confirmed after unmount', async () => {
    apiService.post = jest.fn().mockResolvedValue({ status: 200, data: {} })
    // Capture the confirmation without firing it — the modal outlives the panel.
    mockRequestConfirmation.mockImplementationOnce(
      ({ onConfirm }: { onConfirm: () => void }) => {
        capturedOnConfirm = onConfirm
      },
    )
    const { unmount } = renderForm()

    fireEvent.change(screen.getByTestId('array-add-form-value'), {
      target: { value: 'hello' },
    })
    fireEvent.click(screen.getByTestId('array-add-form-submit'))

    // The panel is discarded (key switch) before the user presses Confirm.
    unmount()
    await act(async () => {
      capturedOnConfirm?.()
    })

    expect(findCall('array/append')).toBeUndefined()
  })

  it('sets at index (POST /array/set-element) when an index is provided', async () => {
    renderForm()

    fireEvent.change(screen.getByTestId('array-add-form-value'), {
      target: { value: 'hello' },
    })
    fireEvent.change(screen.getByTestId('array-add-form-index'), {
      target: { value: '5' },
    })
    fireEvent.click(screen.getByTestId('array-add-form-submit'))

    await waitFor(() => {
      const call = findCall('array/set-element')
      expect(call).toBeTruthy()
      expect((call?.[1] as { index: string }).index).toBe('5')
    })
    expect(findCall('array/append')).toBeFalsy()
  })

  it('disables Add for a non-canonical index', () => {
    renderForm()

    act(() => {
      fireEvent.change(screen.getByTestId('array-add-form-index'), {
        target: { value: '007' },
      })
    })

    expect(screen.getByTestId('array-add-form-submit')).toBeDisabled()
  })
})
