import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import {
  cleanup,
  clearStoreActions,
  mockedStore,
  render,
} from 'uiSrc/utils/test-utils'
import { getWBCustomTutorials } from 'uiSrc/slices/workbench/wb-custom-tutorials'
import EnablementAreaWrapper, { Props } from './EnablementAreaWrapper'

const mockedProps = mock<Props>()

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/workbench/wb-tutorials', () => {
  const defaultState = jest.requireActual(
    'uiSrc/slices/workbench/wb-tutorials',
  ).initialState
  return {
    ...jest.requireActual('uiSrc/slices/workbench/wb-tutorials'),
    workbenchTutorialsSelector: jest.fn().mockReturnValue({
      ...defaultState,
    }),
  }
})

describe('EnablementAreaWrapper', () => {
  it('should render', () => {
    expect(
      render(<EnablementAreaWrapper {...instance(mockedProps)} />),
    ).toBeTruthy()
  })
})
