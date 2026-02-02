import { cloneDeep } from 'lodash'
import React from 'react'
import { cleanup, fireEvent, mockedStore, render } from 'uiSrc/utils/test-utils'
import { KeysStoreData } from 'uiSrc/slices/interfaces/keys'
import { setBrowserTreeNodesOpen } from 'uiSrc/slices/app/context'
import { stringToBuffer } from 'uiSrc/utils'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'
import KeyTree from './KeyTree'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

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
  deleting: false,
  commonFilterType: null,
  selectKey: jest.fn(),
  loadMoreItems: jest.fn(),
  onDelete: jest.fn(),
  onAddKeyPanel: jest.fn(),
  onBulkActionsPanel: jest.fn(),
}

const leafRootFullName = 'test'
const folderFullName = 'car:'
const leaf1FullName = 'car:110'
const leaf2FullName = 'car:210'

const mockWebWorkerResult = [
  {
    children: [
      {
        children: [],
        fullName: leaf1FullName,
        id: '0.0',
        keyApproximate: 0.01,
        keyCount: 1,
        name: '110',
        type: KeyTypes.String,
        isLeaf: true,
        nameBuffer: stringToBuffer(leaf1FullName),
      },
      {
        children: [],
        fullName: leaf2FullName,
        id: '0.1',
        keyApproximate: 0.01,
        keyCount: 1,
        name: '110',
        type: KeyTypes.Hash,
        isLeaf: true,
        nameBuffer: stringToBuffer(leaf2FullName),
      },
    ],
    fullName: folderFullName,
    id: '0',
    keyApproximate: 47.18,
    keyCount: 4718,
    name: 'car',
  },
  {
    children: [],
    fullName: leafRootFullName,
    id: '1',
    keyApproximate: 0.01,
    keyCount: 1,
    type: KeyTypes.Stream,
    isLeaf: true,
    name: 'test',
    nameBuffer: stringToBuffer(leafRootFullName),
  },
]

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  useDisposableWebworker: () => ({
    result: mockWebWorkerResult,
    run: jest.fn(),
  }),
}))

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeyDataSelector: jest.fn().mockReturnValue(null),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('KeyTree', () => {
  it('should be rendered', () => {
    expect(render(<KeyTree {...propsMock} />)).toBeTruthy()
  })

  it('"setBrowserTreeNodesOpen" to be called after click on folder', () => {
    const onSelectedKeyMock = jest.fn()
    const { getByTestId } = render(
      <KeyTree {...propsMock} selectKey={onSelectedKeyMock} />,
    )

    // set open state
    fireEvent.click(getByTestId(`node-item_${folderFullName}`))

    const expectedActions = [
      setBrowserTreeNodesOpen({ [folderFullName]: true }),
    ]

    expect(store.getActions()).toEqual(expect.arrayContaining(expectedActions))
  })

  it('"selectKey" to be called after click on leaf', async () => {
    const onSelectedKeyMock = jest.fn()
    const { getByTestId } = render(
      <KeyTree {...propsMock} selectKey={onSelectedKeyMock} />,
    )

    // open parent folder
    fireEvent.click(getByTestId(`node-item_${folderFullName}`))

    // click on the leaf
    fireEvent.click(getByTestId(`node-item_${leaf2FullName}`))

    expect(onSelectedKeyMock).toBeCalled()
  })

  it('selected key from key list should be opened and selected in the tree', async () => {
    const selectedKeyDataSelectorMock = jest.fn().mockReturnValue({
      name: stringToBuffer(leaf2FullName),
      nameString: leaf2FullName,
    })

    ;(selectedKeyDataSelector as jest.Mock).mockImplementation(
      selectedKeyDataSelectorMock,
    )

    const { getByTestId } = render(<KeyTree {...propsMock} />)

    expect(getByTestId(`node-item_${leaf2FullName}`)).toBeInTheDocument()
  })
})
