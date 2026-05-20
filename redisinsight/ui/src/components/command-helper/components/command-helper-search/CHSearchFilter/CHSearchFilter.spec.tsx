import React from 'react'
import { render, screen, userEvent } from 'uiSrc/utils/test-utils'
import { GROUP_TYPES_DISPLAY } from 'uiSrc/constants'
import CHSearchFilter from './CHSearchFilter'

const redisCommandsPath = 'uiSrc/slices/app/redis-commands'

const commandGroupsMock = ['list', 'hash', 'set', 'vector_set']

jest.mock(redisCommandsPath, () => {
  const defaultState = jest.requireActual(redisCommandsPath).initialState
  return {
    ...jest.requireActual(redisCommandsPath),
    appRedisCommandsSelector: jest.fn().mockReturnValue({
      ...defaultState,
      commandGroups: commandGroupsMock,
    }),
  }
})

describe('CHSearchFilter', () => {
  it('should render', () => {
    expect(render(<CHSearchFilter submitFilter={jest.fn()} />)).toBeTruthy()
  })

  it('should call submitFilter after choose options', async () => {
    const submitFilter = jest.fn()
    render(<CHSearchFilter submitFilter={submitFilter} />)
    const testGroup = commandGroupsMock[0]
    const dropdownButton = screen.getByTestId('select-filter-group-type')
    await userEvent.click(dropdownButton)

    await userEvent.click(
      (await screen.findByText((GROUP_TYPES_DISPLAY as any)[testGroup])) ||
        document,
    )

    expect(submitFilter).toHaveBeenCalledWith(testGroup)
  })

  it('should render the Vector Set group with its display label', async () => {
    render(<CHSearchFilter submitFilter={jest.fn()} />)
    await userEvent.click(screen.getByTestId('select-filter-group-type'))

    expect(await screen.findByText('Vector Set')).toBeInTheDocument()
    expect(
      screen.getByTestId('filter-option-group-type-vector_set'),
    ).toBeInTheDocument()
  })

  it('should submit vector_set when the Vector Set option is selected', async () => {
    const submitFilter = jest.fn()
    render(<CHSearchFilter submitFilter={submitFilter} />)
    await userEvent.click(screen.getByTestId('select-filter-group-type'))

    await userEvent.click(await screen.findByText('Vector Set'))

    expect(submitFilter).toHaveBeenCalledWith('vector_set')
  })
})
