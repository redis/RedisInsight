import { act } from '@testing-library/react'
import { renderHook, mockedStore } from 'uiSrc/utils/test-utils'

import { useDispatchWbQuery } from './useDispatchWbQuery'

describe('useDispatchWbQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedStore.clearActions()
  })

  it('should dispatch sendWbQueryAction when data is provided', () => {
    const data = 'HSET foo bar'

    const afterAll = jest.fn()
    const afterEach = jest.fn()
    const onFail = jest.fn()

    const { result } = renderHook(() => useDispatchWbQuery())
    const dispatchWbQuery = result.current as ReturnType<
      typeof useDispatchWbQuery
    >

    act(() => {
      dispatchWbQuery(data, {
        afterAll,
        afterEach,
        onFail,
      })
    })

    const actions = mockedStore.getActions()

    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'workbenchResults/sendWBCommand',
          payload: expect.objectContaining({
            commands: [data],
            commandId: expect.any(String),
          }),
        }),
      ]),
    )

    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'appContext/setDbIndexState',
          payload: true,
        }),
      ]),
    )

    expect(actions.length).toBeGreaterThanOrEqual(2)
  })

  it('should not dispatch if data is null', () => {
    const { result } = renderHook(() => useDispatchWbQuery())
    const dispatchWbQuery = result.current as ReturnType<
      typeof useDispatchWbQuery
    >

    act(() => {
      dispatchWbQuery(null)
    })

    expect(mockedStore.getActions()).toHaveLength(0)
  })

  it('should not dispatch if data is undefined', () => {
    const { result } = renderHook(() => useDispatchWbQuery())
    const dispatchWbQuery = result.current as ReturnType<
      typeof useDispatchWbQuery
    >

    act(() => {
      dispatchWbQuery(undefined)
    })

    expect(mockedStore.getActions()).toHaveLength(0)
  })
})
