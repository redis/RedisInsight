import React from 'react'
import { act, fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'
import { stringToBuffer } from 'uiSrc/utils'

import { ArrayAddForm } from './ArrayAddForm'

const keyProp = stringToBuffer('mykey')

const renderForm = (closePanel = jest.fn()) =>
  render(<ArrayAddForm keyProp={keyProp} closePanel={closePanel} />)

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
