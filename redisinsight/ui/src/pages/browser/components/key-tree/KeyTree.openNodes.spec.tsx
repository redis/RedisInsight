import React from 'react'
import { faker } from '@faker-js/faker'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { act, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import appContextReducer, {
  setBrowserTreeNodesOpen,
} from 'uiSrc/slices/app/context'
import featuresReducer from 'uiSrc/slices/app/features'
import instancesReducer from 'uiSrc/slices/instances/instances'
import { KeysStoreData } from 'uiSrc/slices/interfaces/keys'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { stringToBuffer } from 'uiSrc/utils'
import KeyTree from './KeyTree'

const [firstFolder, secondFolder, thirdFolder, leaf] = Array.from(
  { length: 4 },
  () => faker.string.alpha({ length: 8 }),
)
const folders = [
  firstFolder,
  `${firstFolder}:${secondFolder}`,
  `${firstFolder}:${secondFolder}:${thirdFolder}`,
]
const selectedKey = `${folders[2]}:${leaf}`
const expectedOpenNodes = Object.fromEntries(
  folders.map((folder) => [folder, true]),
)

// Runs the real tree construction synchronously instead of in a web worker.
jest.mock('uiSrc/services', () => {
  const { useState: useMockState } = jest.requireActual('react')
  const { constructKeysToTree: mockConstructKeysToTree } =
    jest.requireActual('uiSrc/helpers')

  return {
    ...jest.requireActual('uiSrc/services'),
    useDisposableWebworker: () => {
      const [result, setResult] = useMockState(null)
      return {
        result,
        run: (value: any) => setResult(mockConstructKeysToTree(value)),
      }
    },
  }
})

jest.mock('uiSrc/pages/browser/components/no-keys-message', () => () => null)

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeyDataSelector: jest.fn(),
  fetchKeysMetadataTree: jest.fn().mockReturnValue(() => {}),
}))

const keysState = {
  keys: [
    {
      name: stringToBuffer(selectedKey),
      nameString: selectedKey,
      type: 'hash',
      ttl: -1,
      size: 100,
    },
  ],
  nextCursor: '0',
  total: 1,
  scanned: 1,
  shardsMeta: {},
  previousResultCount: 1,
  lastRefreshTime: 1,
} as unknown as KeysStoreData

const props = {
  keysState,
  loading: false,
  deleting: false,
  commonFilterType: null,
  selectKey: jest.fn(),
  loadMoreItems: jest.fn(),
  onDelete: jest.fn(),
  onAddKeyPanel: jest.fn(),
  onBulkActionsPanel: jest.fn(),
}

const createStore = (openActions: unknown[]) =>
  configureStore({
    reducer: {
      app: combineReducers({
        context: appContextReducer,
        features: featuresReducer,
      }),
      connections: combineReducers({ instances: instancesReducer }),
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(
        () => (next) => (action: any) => {
          if (action.type === setBrowserTreeNodesOpen.type) {
            openActions.push(action.payload)
          }
          return next(action)
        },
      ),
  })

const renderComponent = (
  store: ReturnType<typeof createStore>,
  propsOverride: Partial<typeof props> = {},
) => render(<KeyTree {...props} {...propsOverride} />, { store })

const expectFoldersExpanded = () =>
  waitFor(() =>
    folders.forEach((folder) =>
      expect(screen.getByTestId(`node-item_${folder}--expanded`)).toBeVisible(),
    ),
  )

describe('KeyTree open nodes', () => {
  beforeEach(() => {
    ;(selectedKeyDataSelector as jest.Mock).mockReturnValue({
      name: stringToBuffer(selectedKey),
      nameString: selectedKey,
    })
  })

  it('should keep the selected key parents open after the keys are emptied', async () => {
    const store = createStore([])
    let utils: ReturnType<typeof renderComponent> | undefined

    await act(async () => {
      utils = renderComponent(store)
    })
    await expectFoldersExpanded()

    await act(async () => {
      utils?.rerender(
        <KeyTree
          {...props}
          keysState={{ ...keysState, keys: [], total: 0, scanned: 0 }}
        />,
      )
    })

    expect(store.getState().app.context.browser.tree.openNodes).toEqual(
      expect.objectContaining(expectedOpenNodes),
    )
  })

  it('should open the selected key parents without dispatching while rendering', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    const openActions: unknown[] = []
    const store = createStore(openActions)

    await act(async () => {
      renderComponent(store)
    })

    await expectFoldersExpanded()

    const renderPhaseUpdates = consoleError.mock.calls.filter(([message]) =>
      String(message).includes('while rendering a different component'),
    )
    consoleError.mockRestore()

    expect(renderPhaseUpdates).toHaveLength(0)
    expect(store.getState().app.context.browser.tree.openNodes).toEqual(
      expect.objectContaining(expectedOpenNodes),
    )
    // One update for the selected key parents, one for the single-child leaf.
    expect(openActions).toHaveLength(2)
  })
})
