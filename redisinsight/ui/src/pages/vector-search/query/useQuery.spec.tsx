import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from 'uiSrc/slices/store'

import { useQuery } from './useQuery'

const mockStore = {
  ...store,
  getState: () => ({
    vectorSearch: {
      query: {
        items: [],
        clearing: false,
        processing: false,
        isLoaded: false,
        resultsMode: 'DEFAULT',
        activeRunQueryMode: 'ASCII',
      },
    },
    connections: {
      instances: {
        connectedInstance: { id: 'test-instance' },
      },
    },
  }),
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={mockStore}>{children}</Provider>
)

describe('useQuery', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useQuery(), { wrapper })

    expect(result.current.query).toBe('')
    expect(result.current.items).toEqual([])
    expect(result.current.clearing).toBe(false)
    expect(result.current.processing).toBe(false)
    expect(result.current.isResultsLoaded).toBe(false)
  })

  it('should update query state', () => {
    const { result } = renderHook(() => useQuery(), { wrapper })

    act(() => {
      result.current.setQuery('FT.SEARCH index *')
    })

    expect(result.current.query).toBe('FT.SEARCH index *')
  })

  it('should provide all necessary handlers', () => {
    const { result } = renderHook(() => useQuery(), { wrapper })

    expect(typeof result.current.onSubmit).toBe('function')
    expect(typeof result.current.onQueryOpen).toBe('function')
    expect(typeof result.current.onQueryDelete).toBe('function')
    expect(typeof result.current.onAllQueriesDelete).toBe('function')
    expect(typeof result.current.onQueryChangeMode).toBe('function')
    expect(typeof result.current.onChangeGroupMode).toBe('function')
    expect(typeof result.current.onQueryReRun).toBe('function')
    expect(typeof result.current.onQueryProfile).toBe('function')
  })
})
