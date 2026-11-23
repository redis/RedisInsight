/* eslint-disable sonarjs/no-identical-functions */
import React from 'react'
import { cloneDeep, set } from 'lodash'
import { faker } from '@faker-js/faker'
import {
  render,
  screen,
  fireEvent,
  mockedStore,
  mockStore,
  initialStateDefault,
  cleanup,
} from 'uiSrc/utils/test-utils'
import { Nullable, stringToBuffer } from 'uiSrc/utils'
import { setConnectedInstanceId } from 'uiSrc/slices/instances/instances'
import {
  KeyTab,
  KeyTabRemovedReason,
  RedisResponseBuffer,
} from 'uiSrc/slices/interfaces'
import { loadKeys, toggleBrowserFullScreen } from 'uiSrc/slices/browser/keys'
import { SearchMode } from 'uiSrc/slices/interfaces/keys'
import { resetErrors } from 'uiSrc/slices/app/notifications'
import {
  closeBrowserKeyTab,
  openBrowserKeyTab,
  setBrowserBulkActionOpen,
  setBrowserKeyListDataLoaded,
  setBrowserPanelSizes,
  setBrowserSelectedKey,
} from 'uiSrc/slices/app/context'
import BrowserPage from './BrowserPage'
import KeyList, { Props as KeyListProps } from './components/key-tree/KeyTree'
import { Props as KeyDetailsWrapperProps } from './modules/key-details/KeyDetails'
import { KeyDetails } from './modules'
import AddKey, { Props as AddKeyProps } from './components/add-key/AddKey'
import BrowserSearchPanel from './components/browser-search-panel'
import { Props as KeysHeaderProps } from './components/keys-header/KeysHeader'

jest.mock('./components/key-tree/KeyTree', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

jest.mock('./components/add-key/AddKey', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

jest.mock('uiSrc/pages/browser/modules', () => ({
  __esModule: true,
  KeyDetails: jest.fn(),
}))

jest.mock('./components/browser-search-panel', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const mockKeyList = (props: KeyListProps) => (
  <div>
    <button
      type="button"
      data-testid="loadMoreItems-btn"
      onClick={() =>
        props?.handleScanMoreClick?.({ startIndex: 1, stopIndex: 2 })
      }
    >
      loadMoreItems
    </button>
  </div>
)

const mockKeyDetailsWrapper = (props: KeyDetailsWrapperProps) => (
  <div>
    <button
      type="button"
      data-testid="onCloseKey-btn"
      onClick={() => props.onCloseKey()}
    >
      onCloseKey
    </button>
  </div>
)

const mockAddKey = (props: AddKeyProps) => (
  <div>
    <button
      type="button"
      data-testid="handleCloseKey-btn"
      onClick={() => props.handleCloseKey()}
    >
      handleCloseKey
    </button>
  </div>
)

const mockBrowserSearchPanel = (props: KeysHeaderProps) => (
  <div>
    <button
      type="button"
      data-testid="handleAddKeyPanel-btn"
      onClick={() => props?.handleAddKeyPanel?.(true)}
    >
      handleAddKeyPanel
    </button>
    <button
      type="button"
      data-testid="handleBulkActionsPanel-btn"
      onClick={() => props?.handleBulkActionsPanel?.(true)}
    >
      handleBulkActionsPanel
    </button>
  </div>
)

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

/**
 * BrowserPage tests
 *
 * @group component
 */
describe('BrowserPage', () => {
  beforeAll(() => {
    KeyList.mockImplementation(mockKeyList)
    BrowserSearchPanel.mockImplementation(mockBrowserSearchPanel)
    KeyDetails.mockImplementation(mockKeyDetailsWrapper)
    AddKey.mockImplementation(mockAddKey)
  })

  it('should render', () => {
    expect(render(<BrowserPage />)).toBeTruthy()
    const afterRenderActions = [
      setConnectedInstanceId('instanceId'),
      loadKeys(),
      resetErrors(),
    ]
    expect(store.getActions().slice(0, afterRenderActions.length)).toEqual([
      ...afterRenderActions,
    ])
  })

  it('should call loadMoreItems without nextCursor', () => {
    render(<BrowserPage />)
    // select Browser/List view
    fireEvent.click(screen.getByTestId('view-type-list-btn'))

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('loadMoreItems-btn'))

    expect(store.getActions()).toEqual([...afterRenderActions])
  })

  it('should call onCloseKey', () => {
    render(<BrowserPage />)
    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('onCloseKey-btn'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      toggleBrowserFullScreen(true),
    ])
  })

  it('should call proper actions on onmount', () => {
    const { unmount } = render(<BrowserPage />)
    const afterRenderActions = [...store.getActions()]

    unmount()

    const unmountActions = [
      setBrowserPanelSizes(expect.any(Object)),
      setBrowserBulkActionOpen(expect.any(Boolean)),
      setBrowserSelectedKey(null),
      setBrowserKeyListDataLoaded(SearchMode.Pattern, false),
      toggleBrowserFullScreen(false),
    ]

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      ...unmountActions,
    ])
  })

  describe('key tabs', () => {
    const keyNames = faker.helpers.uniqueArray(
      () => faker.string.alphanumeric(10),
      3,
    )
    const [keyA, keyB, keyC] = keyNames.map((name) => stringToBuffer(name))
    const toTabs = (keys: RedisResponseBuffer[]): KeyTab[] =>
      keys.map((key) => ({ key, expiresAt: null, removedReason: null }))

    const renderWithTabs = ({
      tabs,
      selectedKey = null,
      isBulkActionsOpen = false,
    }: {
      tabs: RedisResponseBuffer[]
      selectedKey?: Nullable<RedisResponseBuffer>
      isBulkActionsOpen?: boolean
    }) => {
      let state = cloneDeep(initialStateDefault)
      set(state, 'app.context.contextInstanceId', 'instanceId')
      set(state, 'app.context.browser.keyTabs', toTabs(tabs))
      set(state, 'app.context.browser.keyList.selectedKey', selectedKey)
      set(state, 'app.context.browser.bulkActions.opened', isBulkActionsOpen)

      const tabStore = mockStore(() => state)
      const { rerender } = render(<BrowserPage />, { store: tabStore })
      const afterRenderActions = [...tabStore.getActions()]

      // the mocked store has no reducers: apply the tabs change by hand
      const setTabs = (nextTabs: KeyTab[]) => {
        const { context } = state.app
        state = {
          ...state,
          app: {
            ...state.app,
            context: {
              ...context,
              browser: { ...context.browser, keyTabs: nextTabs },
            },
          },
        }
        rerender(<BrowserPage />)
      }

      return { tabStore, afterRenderActions, setTabs }
    }

    it('should open the right neighbour when the shown key tab is closed', () => {
      const { tabStore, afterRenderActions, setTabs } = renderWithTabs({
        tabs: [keyA, keyB, keyC],
        selectedKey: keyB,
      })

      fireEvent.click(screen.getByTestId(`close-key-tab-${keyNames[1]}`))
      setTabs(toTabs([keyA, keyC]))

      expect(tabStore.getActions()).toEqual([
        ...afterRenderActions,
        closeBrowserKeyTab(keyB),
        setBrowserSelectedKey(keyC),
        openBrowserKeyTab(keyC),
      ])
    })

    it('should open the left neighbour when the shown key is gone from the last tab', () => {
      const { tabStore, afterRenderActions, setTabs } = renderWithTabs({
        tabs: [keyA, keyB],
        selectedKey: keyB,
      })

      // e.g. the key was deleted, its TTL was set to 0 or its last element removed
      setTabs(toTabs([keyA]))

      expect(tabStore.getActions()).toEqual([
        ...afterRenderActions,
        setBrowserSelectedKey(keyA),
        openBrowserKeyTab(keyA),
      ])
    })

    it('should close the panel when the shown key was the only tab', () => {
      const { tabStore, afterRenderActions, setTabs } = renderWithTabs({
        tabs: [keyA],
        selectedKey: keyA,
      })

      setTabs([])

      expect(tabStore.getActions()).toEqual([
        ...afterRenderActions,
        setBrowserSelectedKey(null),
        toggleBrowserFullScreen(true),
      ])
    })

    it('should keep the shown key when another tab is removed', () => {
      const { tabStore, afterRenderActions, setTabs } = renderWithTabs({
        tabs: [keyA, keyB],
        selectedKey: keyA,
      })

      // e.g. a key deleted while another tab was opened
      setTabs(toTabs([keyA]))

      expect(tabStore.getActions()).toEqual(afterRenderActions)
    })

    it('should keep the shown key when its tab is marked as removed', () => {
      const { tabStore, afterRenderActions, setTabs } = renderWithTabs({
        tabs: [keyA, keyB],
        selectedKey: keyB,
      })

      // the key expired or was deleted outside Browser
      setTabs([
        ...toTabs([keyA]),
        {
          key: keyB,
          expiresAt: null,
          removedReason: KeyTabRemovedReason.Expired,
        },
      ])

      expect(tabStore.getActions()).toEqual(afterRenderActions)
      expect(
        screen.getByTestId(`key-tab-expired-${keyNames[1]}`),
      ).toBeInTheDocument()
    })

    it('should close the panel when the last tab is closed without a shown key', () => {
      const { tabStore, afterRenderActions, setTabs } = renderWithTabs({
        tabs: [keyA],
      })

      fireEvent.click(screen.getByTestId(`close-key-tab-${keyNames[0]}`))
      setTabs([])

      expect(tabStore.getActions()).toEqual([
        ...afterRenderActions,
        closeBrowserKeyTab(keyA),
        toggleBrowserFullScreen(true),
      ])
    })

    it('should keep the Bulk Actions panel open when the last tab is closed', () => {
      const { tabStore, afterRenderActions, setTabs } = renderWithTabs({
        tabs: [keyA],
        isBulkActionsOpen: true,
      })

      fireEvent.click(screen.getByTestId(`close-key-tab-${keyNames[0]}`))
      setTabs([])

      expect(tabStore.getActions()).toEqual([
        ...afterRenderActions,
        closeBrowserKeyTab(keyA),
      ])
    })
  })
})
