import React from 'react'
import { useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'

import { RootState } from 'uiSrc/slices/store'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import BulkDeleteSummary from './BulkDeleteSummary'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/browser/bulkActions', () => ({
  ...jest.requireActual('uiSrc/slices/browser/bulkActions'),
  selectedBulkActionsSelector: jest.fn().mockReturnValue({
    type: 'delete',
  }),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}))

beforeEach(() => {
  const state: any = store.getState()

  ;(useSelector as jest.Mock).mockImplementation(
    (callback: (arg0: RootState) => RootState) =>
      callback({
        ...state,
        browser: {
          ...state.browser,
          keys: {
            ...state.browser.keys,
            data: {
              ...state.browser.keys.data,
            },
          },
        },
      }),
  )
})

describe('BulkDeleteSummary', () => {
  it('should render', () => {
    expect(render(<BulkDeleteSummary />)).toBeTruthy()
  })

  it('summary should contain calculated text', () => {
    const state: any = store.getState()

    ;(useSelector as jest.Mock).mockImplementation(
      (callback: (arg0: RootState) => RootState) =>
        callback({
          ...state,
          browser: {
            ...state.browser,
            keys: {
              ...state.browser.keys,
              data: {
                ...state.browser.keys.data,
                scanned: 10,
                total: 100,
                keys: [1],
              },
            },
          },
        }),
    )

    render(<BulkDeleteSummary />)
    const summaryEl = screen.queryByTestId('bulk-delete-summary')
    const expectedText = 'Scanned 10% (10/100) and found 1 keys'

    expect(summaryEl).toHaveTextContent(expectedText)
  })
})
