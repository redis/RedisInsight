import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
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

jest.mock('uiSrc/slices/hooks', () => ({
  ...jest.requireActual('uiSrc/slices/hooks'),
  useAppSelector: jest.fn(),
}))

beforeEach(() => {
  const state: any = store.getState()

  ;(useAppSelector as jest.Mock).mockImplementation(
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
