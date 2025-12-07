import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import LazyInternalPage, { Props } from './LazyInternalPage'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

/**
 * LazyInternalPage tests
 *
 * @group component
 */
describe('LazyInternalPage', () => {
  it('should render', () => {
    expect(render(<LazyInternalPage {...instance(mockedProps)} />)).toBeTruthy()
  })
})
