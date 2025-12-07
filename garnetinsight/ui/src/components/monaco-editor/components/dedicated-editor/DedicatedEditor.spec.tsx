import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { DSL } from 'uiSrc/constants'
import DedicatedEditor, { Props } from './DedicatedEditor'

const SELECT_LANGUAGES_TEST_ID = 'dedicated-editor-language-select'

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

describe('DedicatedEditor', () => {
  it('should render', () => {
    expect(render(<DedicatedEditor {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('should not render select languages if langs.length < 2', () => {
    const { queryByTestId } = render(
      <DedicatedEditor
        {...instance(mockedProps)}
        langs={[DSL.sqliteFunctions]}
      />,
    )

    expect(queryByTestId(SELECT_LANGUAGES_TEST_ID!)).not.toBeInTheDocument()
  })
  it('should render select languages if langs.length >= 2', () => {
    const { queryByTestId } = render(
      <DedicatedEditor
        {...instance(mockedProps)}
        langs={[DSL.sqliteFunctions, DSL.jmespath]}
      />,
    )

    expect(queryByTestId(SELECT_LANGUAGES_TEST_ID!)).toBeInTheDocument()
  })
})
