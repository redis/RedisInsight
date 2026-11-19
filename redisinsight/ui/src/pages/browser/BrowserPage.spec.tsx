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
import { stringToBuffer } from 'uiSrc/utils'
import { setConnectedInstanceId } from 'uiSrc/slices/instances/instances'
import {
  loadKeys,
  resetKeyInfo,
  toggleBrowserFullScreen,
} from 'uiSrc/slices/browser/keys'
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
    <button
      type="button"
      data-testid="onRemoveKey-btn"
      onClick={() => props.onRemoveKey()}
    >
      onRemoveKey
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
    const keyNameString = faker.string.alphanumeric(10)
    const keyName = stringToBuffer(keyNameString)

    const getStoreWithTab = (isBulkActionsOpen = false) => {
      const state = cloneDeep(initialStateDefault)
      set(state, 'app.context.browser.keyTabs', [keyName])
      set(state, 'app.context.browser.bulkActions.opened', isBulkActionsOpen)
      return mockStore(state)
    }

    it('should close the panel when the last tab is closed without a selected key', () => {
      const tabStore = getStoreWithTab()
      render(<BrowserPage />, { store: tabStore })
      const afterRenderActions = [...tabStore.getActions()]

      fireEvent.click(screen.getByTestId(`close-key-tab-${keyNameString}`))

      expect(tabStore.getActions()).toEqual([
        ...afterRenderActions,
        closeBrowserKeyTab(keyName),
        toggleBrowserFullScreen(true),
      ])
    })

    it('should keep the Bulk Actions panel open when the last tab is closed', () => {
      const tabStore = getStoreWithTab(true)
      render(<BrowserPage />, { store: tabStore })
      const afterRenderActions = [...tabStore.getActions()]

      fireEvent.click(screen.getByTestId(`close-key-tab-${keyNameString}`))

      expect(tabStore.getActions()).toEqual([
        ...afterRenderActions,
        closeBrowserKeyTab(keyName),
      ])
    })

    describe('when the selected key is deleted', () => {
      const nextKeyName = stringToBuffer(faker.string.alphanumeric(12))

      const getStoreWithSelectedKey = (tabs: (typeof keyName)[]) => {
        const state = cloneDeep(initialStateDefault)
        set(state, 'app.context.contextInstanceId', 'instanceId')
        set(state, 'app.context.browser.keyTabs', tabs)
        set(state, 'app.context.browser.keyList.selectedKey', keyName)
        return mockStore(state)
      }

      it('should close its tab and open the neighbour one', () => {
        const tabStore = getStoreWithSelectedKey([keyName, nextKeyName])
        render(<BrowserPage />, { store: tabStore })
        const afterRenderActions = [...tabStore.getActions()]

        fireEvent.click(screen.getByTestId('onRemoveKey-btn'))

        expect(tabStore.getActions()).toEqual([
          ...afterRenderActions,
          resetKeyInfo(),
          closeBrowserKeyTab(keyName),
          setBrowserSelectedKey(nextKeyName),
          openBrowserKeyTab(nextKeyName),
        ])
      })

      it('should close the panel when it was the only tab', () => {
        const tabStore = getStoreWithSelectedKey([keyName])
        render(<BrowserPage />, { store: tabStore })
        const afterRenderActions = [...tabStore.getActions()]

        fireEvent.click(screen.getByTestId('onRemoveKey-btn'))

        expect(tabStore.getActions()).toEqual([
          ...afterRenderActions,
          resetKeyInfo(),
          closeBrowserKeyTab(keyName),
          setBrowserSelectedKey(null),
          toggleBrowserFullScreen(true),
        ])
      })
    })
  })
})
