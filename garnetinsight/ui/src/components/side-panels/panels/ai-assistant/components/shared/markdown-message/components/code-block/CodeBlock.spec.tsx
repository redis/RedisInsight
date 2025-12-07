import React from 'react'
import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  cleanup,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { ButtonLang } from 'uiSrc/utils/formatters/markdown/remarkCode'

import { sendWBCommand } from 'uiSrc/slices/workbench/wb-results'
import { setDbIndexState } from 'uiSrc/slices/app/context'
import { CommandExecutionType } from 'uiSrc/slices/interfaces'
import CodeBlock from './CodeBlock'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('CodeBlock', () => {
  it('should render', () => {
    expect(render(<CodeBlock>1</CodeBlock>)).toBeTruthy()
  })

  it('should call proper action after click on run button', () => {
    render(<CodeBlock lang={ButtonLang.Redis}>info</CodeBlock>)

    fireEvent.click(screen.getByTestId('run-btn-'))

    expect(store.getActions()).toEqual([
      sendWBCommand({
        commandId: expect.any(String),
        commands: ['info'],
      }),
      setDbIndexState(true),
    ])
  })
})
