import { KeyTypes } from 'uiSrc/constants'
import { KeysBrowserContextValue } from '../KeysBrowser.types'

export const createMockKeysBrowserContext = (
  overrides: Partial<KeysBrowserContextValue> = {},
): KeysBrowserContextValue => ({
  loading: false,
  headerLoading: false,
  keysState: {
    keys: [],
    nextCursor: '0',
    total: 0,
    scanned: 0,
    lastRefreshTime: null,
    previousResultCount: 0,
    shardsMeta: {},
  },
  keysError: '',
  commonFilterType: null,
  scrollTopPosition: 0,
  activeTab: KeyTypes.Hash,
  isSearched: false,
  isFiltered: false,
  keyListRef: { current: null },
  selectKey: jest.fn(),
  handleRefreshKeys: jest.fn(),
  handleEnableAutoRefresh: jest.fn(),
  handleChangeAutoRefreshRate: jest.fn(),
  handleTabChange: jest.fn(),
  loadMoreItems: jest.fn(),
  handleScanMore: jest.fn(),
  ...overrides,
})
