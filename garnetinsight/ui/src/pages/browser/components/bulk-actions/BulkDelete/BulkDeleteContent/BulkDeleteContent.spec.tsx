import React from 'react'
import { useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'

import { RootState } from 'uiSrc/slices/store'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'

import BulkDeleteContent from './BulkDeleteContent'

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

describe('BulkDeleteContent', () => {
  it('should render', () => {
    expect(render(<BulkDeleteContent />)).toBeTruthy()
  })
})
