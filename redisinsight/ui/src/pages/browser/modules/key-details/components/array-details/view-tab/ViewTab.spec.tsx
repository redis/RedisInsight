import React from 'react'
import { cloneDeep } from 'lodash'
import {
  fireEvent,
  initialStateDefault,
  mockStore,
  render,
  screen,
  waitFor,
} from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import { initialState as initialStateArray } from 'uiSrc/slices/browser/array'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'
import { arrayElementWithValueFactory } from 'uiSrc/mocks/factories/browser/array/arrayElement.factory'
import ViewTab from './ViewTab'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

const KEY = 'readings'
const keyBuffer = stringToBuffer(KEY)

const buildState = (elements: ArrayDataElement[]) => {
  const next = cloneDeep(initialStateDefault)
  next.browser.array = cloneDeep(initialStateArray)
  next.browser.array.data = { ...next.browser.array.data, elements }
  next.browser.keys.selectedKey.loading = false
  next.browser.keys.selectedKey.data = {
    type: KeyTypes.Array,
    name: keyBuffer,
  } as any
  return next
}

const renderTab = (elements: ArrayDataElement[]) => {
  const store = mockStore(buildState(elements))
  store.clearActions()
  return render(<ViewTab keyProp={keyBuffer} isActive />, { store })
}

describe('ViewTab', () => {
  it('renders a per-row delete affordance for a populated element', () => {
    renderTab([arrayElementWithValueFactory.build({ index: '7' })])

    expect(screen.getByTestId('array-remove-btn-7-icon')).toBeInTheDocument()
  })

  it('deletes the element via ARDEL on confirm', async () => {
    apiService.delete = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { affected: '1' } })
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { keyName: KEY, count: '3' } })

    renderTab([arrayElementWithValueFactory.build({ index: '7' })])

    fireEvent.click(screen.getByTestId('array-remove-btn-7-icon'))
    fireEvent.click(await screen.findByTestId('array-remove-btn-7'))

    await waitFor(() =>
      expect(apiService.delete).toHaveBeenCalledWith(
        expect.stringContaining('array/elements'),
        expect.objectContaining({
          data: { keyName: keyBuffer, indexes: ['7'] },
        }),
      ),
    )
  })

  it('bulk-deletes the selected elements via a single ARDEL', async () => {
    apiService.delete = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { affected: '2' } })
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { keyName: KEY, count: '0' } })

    renderTab([
      arrayElementWithValueFactory.build({ index: '0' }),
      arrayElementWithValueFactory.build({ index: '5' }),
    ])

    // The header checkbox selects every loaded row.
    fireEvent.click(screen.getByRole('checkbox', { name: /all rows/i }))

    // The contextual bar appears once a selection exists.
    expect(
      await screen.findByTestId('array-bulk-delete-bar'),
    ).toHaveTextContent('2 selected')

    fireEvent.click(screen.getByTestId('array-bulk-remove-btn-icon'))
    fireEvent.click(await screen.findByTestId('array-bulk-remove-btn'))

    await waitFor(() =>
      expect(apiService.delete).toHaveBeenCalledWith(
        expect.stringContaining('array/elements'),
        expect.objectContaining({
          data: { keyName: keyBuffer, indexes: ['0', '5'] },
        }),
      ),
    )
  })
})
