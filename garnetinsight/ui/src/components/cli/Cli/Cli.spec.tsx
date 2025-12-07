import React from 'react'
import { KeyboardKeys as keys } from 'uiSrc/constants/keys'
import { fireEvent, render } from 'uiSrc/utils/test-utils'
import CLI from './Cli'

const redisCommandsPath = 'uiSrc/slices/app/redis-commands'

jest.mock(redisCommandsPath, () => {
  const defaultState = jest.requireActual(redisCommandsPath).initialState
  return {
    ...jest.requireActual(redisCommandsPath),
    appRedisCommandsSelector: jest.fn().mockReturnValue({
      ...defaultState,
    }),
  }
})

describe('CLI', () => {
  it('should render', () => {
    expect(render(<CLI />)).toBeTruthy()
  })
  it('on "Esc" key should focus to "close-cli" button', () => {
    const { getByTestId } = render(<CLI />)

    fireEvent.keyDown(getByTestId('cli-command'), { key: keys.ESCAPE })

    expect(getByTestId('close-cli')).toHaveFocus()
  })
})
