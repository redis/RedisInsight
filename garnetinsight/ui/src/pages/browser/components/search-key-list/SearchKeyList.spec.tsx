import { cloneDeep } from 'lodash'
import React from 'react'
import { KeyboardKeys as keys } from 'uiSrc/constants/keys'
import {
  act,
  cleanup,
  clearStoreActions,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import {
  keysSelector,
  loadKeys,
  loadSearchHistory,
  setFilter,
  setPatternSearchMatch,
} from 'uiSrc/slices/browser/keys'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import { changeSidePanel } from 'uiSrc/slices/panels/sidePanels'
import { SidePanels } from 'uiSrc/slices/interfaces/insights'
import { setSelectedTab } from 'uiSrc/slices/panels/aiAssistant'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import SearchKeyList from './SearchKeyList'

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  keysSearchHistorySelector: jest.fn().mockReturnValue({
    data: [
      { id: '1', mode: 'pattern', filter: { type: 'list', match: '*' } },
      { id: '2', mode: 'pattern', filter: { type: 'list', match: '*' } },
    ],
  }),
  keysSelector: jest.fn().mockReturnValue({
    searchMode: 'Pattern',
    filter: null,
    search: '',
    viewType: 'Browser',
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '',
  }),
}))

jest.mock('uiSrc/slices/browser/redisearch', () => ({
  ...jest.requireActual('uiSrc/slices/browser/redisearch'),
  redisearchSelector: jest.fn().mockReturnValue({
    search: '',
    selectedIndex: null,
  }),
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    databaseChat: {
      flag: true,
    },
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('SearchKeyList', () => {
  it('should render', () => {
    expect(render(<SearchKeyList />)).toBeTruthy()
    const searchInput = screen.getByTestId('search-key')
    expect(searchInput).toBeInTheDocument()
  })

  it('should load history after render', () => {
    ;(connectedInstanceSelector as jest.Mock).mockImplementationOnce(() => ({
      id: '1',
    }))

    render(<SearchKeyList />)
    const expectedActions = [loadSearchHistory()]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('"setSearchMatch" should be called after "onChange"', () => {
    const searchTerm = 'a'

    render(<SearchKeyList />)

    fireEvent.change(screen.getByTestId('search-key'), {
      target: { value: searchTerm },
    })

    fireEvent.keyDown(screen.getByTestId('search-key'), { key: keys.ENTER })

    const expectedActions = [setPatternSearchMatch(searchTerm), loadKeys()]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('should call proper actions after apply suggestion', async () => {
    await act(() => {
      render(<SearchKeyList />)
    })

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('show-suggestions-btn'))
    fireEvent.click(screen.getByTestId('suggestion-item-2'))

    const expectedActions = [
      setFilter('list'),
      setPatternSearchMatch('*'),
      loadKeys(),
    ]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions([...afterRenderActions, ...expectedActions]),
    )
  })

  it('"loadKeys" should not be called after Enter if searchMode=Redisearch and index=null', async () => {
    const searchTerm = 'a'

    ;(keysSelector as jest.Mock).mockImplementation(() => ({
      searchMode: SearchMode.Redisearch,
      viewType: KeyViewType.Browser,
      isSearch: false,
      isFiltered: false,
    }))

    render(<SearchKeyList />)

    fireEvent.change(screen.getByTestId('search-key'), {
      target: { value: searchTerm },
    })

    fireEvent.keyDown(screen.getByTestId('search-key'), { key: keys.ENTER })

    const afterRenderActions = [...store.getActions()]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions([...afterRenderActions]),
    )

    fireEvent.click(screen.getByTestId('search-btn'))

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions([...afterRenderActions]),
    )
  })

  it('should call proper actions after click on ask copilot', async () => {
    ;(keysSelector as jest.Mock).mockImplementation(() => ({
      searchMode: SearchMode.Redisearch,
      viewType: KeyViewType.Browser,
      isSearch: false,
      isFiltered: false,
    }))

    render(<SearchKeyList />)

    fireEvent.click(screen.getByTestId('ask-redis-copilot-btn'))

    const expectedActions = [
      setSelectedTab(AiChatType.Query),
      changeSidePanel(SidePanels.AiAssistant),
    ]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions([...expectedActions]),
    )
  })

  it('should not render ask copilot if feature is disabled', async () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      databaseChat: {
        flag: false,
      },
    })
    ;(keysSelector as jest.Mock).mockImplementation(() => ({
      searchMode: SearchMode.Redisearch,
      viewType: KeyViewType.Browser,
      isSearch: false,
      isFiltered: false,
    }))

    render(<SearchKeyList />)

    expect(
      screen.queryByTestId('ask-redis-copilot-btn'),
    ).not.toBeInTheDocument()
  })
})
