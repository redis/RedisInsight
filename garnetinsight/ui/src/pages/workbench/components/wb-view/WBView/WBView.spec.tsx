import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
// import MonacoEditor from 'react-monaco-editor'
import { cleanup, fireEvent, mockedStore, render } from 'uiSrc/utils/test-utils'
import WBView, { Props } from './WBView'

const mockedProps = mock<Props>()

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

// jest.mock('react-monaco-editor', () => jest.fn().mockImplementation(() =>
//   <div data-testid="monaco">Monaco</div>))

jest.mock('uiSrc/utils/workbench', () => ({
  ...jest.requireActual('uiSrc/utils/workbench'),
  updateWBHistoryStorage: jest.fn(),
}))

describe('WBView', () => {
  it('should render', () => {
    expect(render(<WBView {...instance(mockedProps)} />)).toBeTruthy()
  })

  describe('Workbench input keyboard cases', () => {
    it.skip('"Enter" keydown should call "onSubmit"', () => {
      const command = 'info'
      const onSubmitMock = jest.fn()

      const { queryByTestId } = render(
        <WBView
          {...instance(mockedProps)}
          script={command}
          onSubmit={onSubmitMock}
        />,
      )

      const monacoEl = queryByTestId('monaco')

      fireEvent.keyDown(monacoEl, {
        code: 'Enter',
        ctrlKey: true,
      })

      expect(onSubmitMock).toBeCalled()
    })
  })
})
