import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  cleanup,
  mockedStore,
  render,
  screen,
  fireEvent,
} from 'uiSrc/utils/test-utils'
import CliInput, { Props } from './CliInput'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('CliInput', () => {
  it('should render', () => {
    expect(render(<CliInput {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render db index if it is greater than 0', () => {
    const { queryByTestId } = render(
      <CliInput {...instance(mockedProps)} dbIndex={1} />,
    )
    const dbIndexEl = queryByTestId('cli-db-index')

    expect(dbIndexEl).toBeInTheDocument()
    expect(dbIndexEl).toHaveTextContent('[db1]')
  })

  it('should not render db index if it is 0', () => {
    const { queryByTestId } = render(
      <CliInput {...instance(mockedProps)} dbIndex={0} />,
    )
    const dbIndexEl = queryByTestId('cli-db-index')

    expect(dbIndexEl).not.toBeInTheDocument()
  })

  // It's not possible to simulate events on contenteditable with testing-react-library,
  // or any testing library that uses js - dom, because of a limitation on js - dom itself.
  // https://github.com/testing-library/dom-testing-library/pull/235
  it.skip('"onChange" should be called', async () => {
    const command = 'keys *'
    const setCommandMock = jest.fn()

    render(<CliInput {...instance(mockedProps)} setCommand={setCommandMock} />)

    const cliInput = screen.getByTestId('cli-command')

    fireEvent.blur(cliInput, { target: { innerHTML: command } })

    expect(setCommandMock).toBeCalledTimes(command.length)
  })

  it('onMouseUp should be called', async () => {
    const setCommandMock = jest.fn()

    render(<CliInput {...instance(mockedProps)} setCommand={setCommandMock} />)

    const cliInput = screen.getByTestId('cli-command')

    fireEvent.mouseUp(cliInput)

    expect(setCommandMock).not.toBeCalled()
  })
})
