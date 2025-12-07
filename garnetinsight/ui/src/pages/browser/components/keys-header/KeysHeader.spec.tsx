import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import {
  setBrowserPatternKeyListDataLoaded,
  setBrowserSelectedKey,
} from 'uiSrc/slices/app/context'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import * as keysSlice from 'uiSrc/slices/browser/keys'
import {
  KeysStoreData,
  KeyViewType,
  SearchMode,
} from 'uiSrc/slices/interfaces/keys'
import { BrowserColumns } from 'uiSrc/constants'

import { setConnectivityError } from 'uiSrc/slices/app/connectivity'
import KeysHeader from './KeysHeader'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  ;(keysSlice.keysSelector as jest.Mock).mockReturnValue({
    ...mockSelectorData,
  })
})

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  keysSelector: jest.fn().mockReturnValue(mockSelectorData),
  fetchKeys: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest
    .fn()
    .mockReturnValue({ keyNameFormat: 'Unicode' }),
}))
const connectedInstanceSelectorMock = connectedInstanceSelector as jest.Mock

const propsMock = {
  keysState: {
    keys: [
      {
        name: 'key1',
        type: 'hash',
        ttl: -1,
        size: 100,
        length: 100,
      },
      {
        name: 'key2',
        type: 'hash',
        ttl: -1,
        size: 150,
        length: 100,
      },
      {
        name: 'key3',
        type: 'hash',
        ttl: -1,
        size: 110,
        length: 100,
      },
    ],
    nextCursor: '0',
    total: 3,
    scanned: 5,
    shardsMeta: {},
    previousResultCount: 1,
    lastRefreshTime: 3,
  } as KeysStoreData,
  loading: false,
  sizes: {},
  loadKeys: jest.fn(),
  loadMoreItems: jest.fn(),
  handleAddKeyPanel: jest.fn(),
  nextCursor: '0',
  isSearched: false,
  handleScanMoreClick: jest.fn(),
}

const mockSelectorData = {
  searchMode: SearchMode.Pattern,
  viewType: KeyViewType.Browser,
  isSearch: false,
  isFiltered: false,
  shownColumns: [BrowserColumns.TTL, BrowserColumns.Size],
}

describe('KeysHeader', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(render(<KeysHeader {...propsMock} />)).toBeTruthy()
  })

  it('should render key view type switcher properly', () => {
    render(<KeysHeader {...propsMock} />)

    const keyViewTypeSwitcherInput = screen.queryByTestId('view-type-switcher')
    expect(keyViewTypeSwitcherInput).toBeInTheDocument()
  })

  it('should render Tree view enabled when format is Unicode', () => {
    render(<KeysHeader {...propsMock} />)

    const keyViewTypeSwitcherInput = screen.queryByTestId('view-type-list-btn')
    expect(keyViewTypeSwitcherInput).toBeInTheDocument()
    expect(keyViewTypeSwitcherInput).not.toBeDisabled()
  })

  it('should disable Tree view when key format is HEX', () => {
    connectedInstanceSelectorMock.mockReturnValue({
      keyNameFormat: 'HEX',
    })
    render(<KeysHeader {...propsMock} />)

    const keyViewTypeSwitcherInput = screen.queryByTestId('view-type-list-btn')
    expect(keyViewTypeSwitcherInput).toBeInTheDocument()
    expect(keyViewTypeSwitcherInput).toBeDisabled()
  })

  it('should render Scan more button if total => keys.length', () => {
    ;(keysSlice.keysSelector as jest.Mock).mockReturnValue({
      ...mockSelectorData,
      searchMode: SearchMode.Redisearch,
      viewType: KeyViewType.Tree,
    })

    const { queryByTestId } = render(
      <KeysHeader
        {...propsMock}
        keysState={{
          ...propsMock.keysState,
          maxResults: 200,
          total: 200,
        }}
        nextCursor="3"
      />,
    )

    expect(queryByTestId('scan-more')).toBeInTheDocument()
  })

  it('should not render Scan more button for if searchMode = "Redisearch" and keys.length > maxResults', () => {
    ;(keysSlice.keysSelector as jest.Mock).mockReturnValue({
      ...mockSelectorData,
      searchMode: SearchMode.Redisearch,
      viewType: KeyViewType.Tree,
    })

    const { queryByTestId } = render(
      <KeysHeader
        {...propsMock}
        keysState={{
          ...propsMock.keysState,
          maxResults: propsMock.keysState.keys.length - 1,
          total: 200,
          nextCursor: '3',
        }}
      />,
    )

    expect(queryByTestId('scan-more')).not.toBeInTheDocument()
  })

  it('should reset selected key data when no keys data is returned', async () => {
    ;(keysSlice.fetchKeys as jest.Mock).mockImplementation(
      (_options: any, onSuccess: (data: any) => void, __onFailed: () => void) =>
        () => {
          onSuccess({ keys: [] }) // Simulate empty data response
        },
    )

    render(<KeysHeader {...propsMock} />)

    fireEvent.click(screen.getByTestId('keys-refresh-btn'))

    const expectedActions = [
      keysSlice.resetKeyInfo(),
      setBrowserSelectedKey(null),
      setBrowserPatternKeyListDataLoaded(true),
      setConnectivityError(null),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
