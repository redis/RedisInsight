import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  mockedStore,
  cleanup,
} from 'uiSrc/utils/test-utils'
import {
  DEFAULT_SLOWLOG_MAX_LEN,
  DEFAULT_SLOWLOG_SLOWER_THAN,
} from 'uiSrc/constants'

import SlowLogConfig, { Props } from './SlowLogConfig'

const mockedProps = mock<Props>()

const slowlogMaxLenMock = 123
const slowlogLogSlowerThanMock = 1000

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/analytics/slowlog', () => ({
  ...jest.requireActual('uiSrc/slices/analytics/slowlog'),
  slowLogConfigSelector: jest.fn().mockReturnValue({
    slowlogMaxLen: slowlogMaxLenMock,
    slowlogLogSlowerThan: slowlogLogSlowerThanMock,
  }),
}))

describe('SlowLogConfig', () => {
  it('should render', () => {
    expect(render(<SlowLogConfig {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should change "slower-than-input" value properly', () => {
    render(<SlowLogConfig {...instance(mockedProps)} />)
    fireEvent.change(screen.getByTestId('slower-than-input'), {
      target: { value: '123' },
    })
    expect(screen.getByTestId('slower-than-input')).toHaveValue('123')
  })

  it('should change "max-len-input" value properly', () => {
    render(<SlowLogConfig {...instance(mockedProps)} />)
    fireEvent.change(screen.getByTestId('max-len-input'), {
      target: { value: '123' },
    })
    expect(screen.getByTestId('max-len-input')).toHaveValue('123')
  })

  it('btn Cancel should call "closePopover" and do not call "onRefresh"', () => {
    const onRefresh = jest.fn()
    const closePopover = jest.fn()
    render(<SlowLogConfig onRefresh={onRefresh} closePopover={closePopover} />)
    fireEvent.change(screen.getByTestId('max-len-input'), {
      target: { value: '123' },
    })
    fireEvent.change(screen.getByTestId('slower-than-input'), {
      target: { value: '123' },
    })

    fireEvent.click(screen.getByTestId('slowlog-config-cancel-btn'))
    expect(closePopover).toBeCalled()
    expect(onRefresh).not.toBeCalled()
  })

  it('btn Default should do not call "closePopover" and "onRefresh"', () => {
    const onRefresh = jest.fn()
    const closePopover = jest.fn()
    render(<SlowLogConfig onRefresh={onRefresh} closePopover={closePopover} />)
    fireEvent.change(screen.getByTestId('max-len-input'), {
      target: { value: '123' },
    })
    fireEvent.change(screen.getByTestId('slower-than-input'), {
      target: { value: '123' },
    })

    fireEvent.click(screen.getByTestId('slowlog-config-default-btn'))
    expect(closePopover).not.toBeCalled()
    expect(onRefresh).not.toBeCalled()
  })

  it('btn Default should reset form"', () => {
    const onRefresh = jest.fn()
    const closePopover = jest.fn()
    render(<SlowLogConfig onRefresh={onRefresh} closePopover={closePopover} />)
    fireEvent.change(screen.getByTestId('max-len-input'), {
      target: { value: '12323' },
    })
    fireEvent.change(screen.getByTestId('slower-than-input'), {
      target: { value: '123223' },
    })

    fireEvent.click(screen.getByTestId('slowlog-config-default-btn'))
    expect(screen.getByTestId('max-len-input')).toHaveValue(
      `${DEFAULT_SLOWLOG_MAX_LEN}`,
    )
    expect(screen.getByTestId('slower-than-input')).toHaveValue(
      `${DEFAULT_SLOWLOG_SLOWER_THAN}`,
    )
  })
})
