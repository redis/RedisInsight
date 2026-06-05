import React, { useContext } from 'react'
import { cloneDeep } from 'lodash'
import { MemoryRouter } from 'react-router-dom'
import { render, mockStore, initialStateDefault } from 'uiSrc/utils/test-utils'
import { setPatternSearchMatch } from 'uiSrc/slices/browser/keys'

import { KeysBrowserContext, Provider } from './Context'

const Consumer = () => {
  useContext(KeysBrowserContext)
  return <div data-testid="consumer" />
}

const renderProvider = (search: string) => {
  const state = cloneDeep(initialStateDefault)
  state.browser.keys.search = search

  const store = mockStore(state)

  render(
    <MemoryRouter>
      <Provider onSelectKey={jest.fn()}>
        <Consumer />
      </Provider>
    </MemoryRouter>,
    { store },
  )

  return store
}

describe('KeysBrowserContext Provider (vector-search)', () => {
  it('should clear the Browser page search pattern on mount so the key list is unfiltered', () => {
    const store = renderProvider('user:*')

    expect(store.getActions()).toContainEqual(setPatternSearchMatch(''))
  })

  it('should clear the search pattern even when no browser filter was set', () => {
    const store = renderProvider('')

    expect(store.getActions()).toContainEqual(setPatternSearchMatch(''))
  })
})
