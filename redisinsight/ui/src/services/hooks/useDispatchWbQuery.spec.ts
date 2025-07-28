import { renderHook } from '@testing-library/react-hooks'
import { act } from '@testing-library/react'
import { useDispatch } from 'react-redux'
import * as WbResults from 'uiSrc/slices/workbench/wb-results'

import { useDispatchWbQuery } from './useDispatchWbQuery'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}))

jest.mock('uiSrc/slices/workbench/wb-results', () => ({
  sendWbQueryAction: jest.fn(),
}))

const mockedUseDispatch = useDispatch as jest.Mock

describe('useDispatchWbQuery', () => {
  const mockDispatch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseDispatch.mockReturnValue(mockDispatch)

    jest.spyOn(WbResults, 'sendWbQueryAction')
  })

  it('should dispatch sendWbQueryAction when data is provided', () => {
    const data = 'HSET foo bar'

    const afterAll = jest.fn()
    const afterEach = jest.fn()
    const onFail = jest.fn()

    const { result } = renderHook(() =>
      useDispatchWbQuery({
        afterAll,
        afterEach,
        onFail,
      }),
    )

    act(() => {
      result.current(data)
    })

    expect(WbResults.sendWbQueryAction).toHaveBeenCalledWith(
      data,
      undefined,
      undefined,
      {
        afterAll,
        afterEach,
      },
      onFail,
    )

    expect(mockDispatch).toHaveBeenCalledTimes(1)
  })

  it('should not dispatch if data is null', () => {
    const { result } = renderHook(() => useDispatchWbQuery())

    act(() => {
      result.current(null)
    })

    expect(WbResults.sendWbQueryAction).not.toHaveBeenCalled()
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should not dispatch if data is undefined', () => {
    const { result } = renderHook(() => useDispatchWbQuery())

    act(() => {
      result.current(null)
    })

    expect(WbResults.sendWbQueryAction).not.toHaveBeenCalled()
    expect(mockDispatch).not.toHaveBeenCalled()
  })
})
