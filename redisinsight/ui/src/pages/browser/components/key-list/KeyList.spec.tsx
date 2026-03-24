import React from 'react'
import { cloneDeep } from 'lodash'
import { fireEvent } from '@testing-library/react'
import {
  cleanup,
  mockedStore,
  render,
  waitFor,
  screen,
  clearStoreActions,
} from 'uiSrc/utils/test-utils'
import {
  KeysStoreData,
  KeyViewType,
  SearchMode,
} from 'uiSrc/slices/interfaces/keys'
import {
  deleteKey,
  keysSelector,
  setLastBatchKeys,
} from 'uiSrc/slices/browser/keys'
import { apiService } from 'uiSrc/services'
import { BrowserColumns, SortOrder } from 'uiSrc/constants'
import { bufferToHex, bufferToString } from 'uiSrc/utils'
import { RedisResponseBufferType } from 'uiSrc/slices/interfaces'

import KeyList from './KeyList'

const propsMock = {
  keysState: {
    keys: [
      {
        name: {
          data: Buffer.from('key1'),
          type: RedisResponseBufferType.Buffer,
        },
        type: 'hash',
        ttl: -1,
        size: 100,
        length: 100,
        nameString: 'key1',
      },
      {
        name: {
          data: Buffer.from('key2'),
          type: RedisResponseBufferType.Buffer,
        },
        type: 'hash',
        ttl: -1,
        size: 150,
        length: 100,
        nameString: 'key2',
      },
      {
        name: {
          data: Buffer.from('key3'),
          type: RedisResponseBufferType.Buffer,
        },
        type: 'hash',
        ttl: -1,
        size: 110,
        length: 100,
        nameString: 'key3',
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
  selectKey: jest.fn(),
  loadMoreItems: jest.fn(),
  handleAddKeyPanel: jest.fn(),
  onDelete: jest.fn(),
  commonFilterType: null,
  onAddKeyPanel: jest.fn(),
}

const mockedKeySlice = {
  viewType: KeyViewType.Browser,
  searchMode: SearchMode.Pattern,
  isSearch: false,
  isFiltered: false,
  deleting: false,
  data: {
    keys: [],
    nextCursor: '0',
    previousResultCount: 0,
    total: 0,
    scanned: 0,
    lastRefreshTime: Date.now(),
  },
  selectedKey: {
    data: null,
  },
}

const getKeyFormat = (keyName: string) => ({
  data: Buffer.from(keyName),
  type: RedisResponseBufferType.Buffer,
})

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  keysSelector: jest.fn().mockImplementation(() => mockedKeySlice),
}))

const mockedUseKeyFormatHandler = jest.fn().mockImplementation(bufferToString)

jest.mock('../use-key-format', () => ({
  useKeyFormat: () => ({
    handler: mockedUseKeyFormatHandler,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('KeyList', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(render(<KeyList {...propsMock} />)).toBeTruthy()
  })

  it('should render keys encoded in hex', () => {
    mockedUseKeyFormatHandler.mockImplementation(bufferToHex)

    render(<KeyList {...propsMock} />)

    expect(screen.getByTestId('key-6b657931')).toBeInTheDocument()
  })

  it('should render rows properly', () => {
    const { container } = render(<KeyList {...propsMock} />)
    const rows = container.querySelectorAll(
      '.ReactVirtualized__Table__row[role="row"]',
    )
    expect(rows).toHaveLength(3)
  })

  // TODO: find solution for mock "setLastBatchKeys" action
  it.skip('should call "setLastBatchKeys" after unmount for Browser view', () => {
    ;(keysSelector as jest.Mock).mockImplementation(() => mockedKeySlice)

    const { unmount } = render(<KeyList {...propsMock} />)
    expect(setLastBatchKeys).not.toBeCalled()

    unmount()

    expect(setLastBatchKeys).toBeCalledTimes(1)
  })

  // TODO: find solution for mock "setLastBatchKeys" action
  it.skip('should not call "setLastBatchKeys" after unmount for Tree view', () => {
    ;(keysSelector as jest.Mock).mockImplementation(() => ({
      ...mockedKeySlice,
      viewType: KeyViewType.Tree,
    }))

    const { unmount } = render(<KeyList {...propsMock} />)
    expect(setLastBatchKeys).not.toBeCalled()

    unmount()

    expect(setLastBatchKeys).not.toBeCalled()
  })

  it('should call apiService.post to get key info', async () => {
    const apiServiceMock = jest
      .fn()
      .mockResolvedValue(cloneDeep(propsMock.keysState.keys))
    apiService.post = apiServiceMock

    const { rerender } = render(
      <KeyList
        {...propsMock}
        keysState={{ ...propsMock.keysState, keys: [] }}
      />,
    )

    rerender(
      <KeyList
        {...propsMock}
        keysState={{
          ...propsMock.keysState,
          keys: propsMock.keysState.keys.map(({ name }) => ({ name })),
        }}
      />,
    )

    await waitFor(
      async () => {
        expect(apiServiceMock).toBeCalled()
      },
      { timeout: 150 },
    )
  })

  it('apiService.post should be called with only keys without info', async () => {
    const controller = new AbortController()
    const params = { params: { encoding: 'buffer' }, signal: controller.signal }
    const apiServiceMock = jest
      .fn()
      .mockResolvedValue(cloneDeep(propsMock.keysState.keys))
    apiService.post = apiServiceMock

    const { rerender } = render(
      <KeyList
        {...propsMock}
        keysState={{ ...propsMock.keysState, keys: [] }}
      />,
    )

    rerender(
      <KeyList
        {...propsMock}
        keysState={{
          ...propsMock.keysState,
          keys: [
            ...cloneDeep(propsMock.keysState.keys).map(({ name }) => ({
              name,
            })),
            { name: getKeyFormat('key5'), size: 100, length: 100 }, // key with info
          ],
        }}
      />,
    )

    await waitFor(
      async () => {
        expect(apiServiceMock.mock.calls[0]).toEqual([
          '/databases//keys/get-metadata',
          { keys: [getKeyFormat('key1')], includeSize: true, includeTTL: true },
          params,
        ])

        expect(apiServiceMock.mock.calls[1]).toEqual([
          '/databases//keys/get-metadata',
          {
            keys: [
              getKeyFormat('key1'),
              getKeyFormat('key2'),
              getKeyFormat('key3'),
            ],
            includeSize: true,
            includeTTL: true,
          },
          params,
        ])
      },
      { timeout: 150 },
    )
  })

  it('key info loadings (type, ttl, size) should be in the DOM if keys do not have info', async () => {
    const { rerender, queryAllByTestId } = render(
      <KeyList
        {...propsMock}
        keysState={{ ...propsMock.keysState, keys: [] }}
      />,
    )

    rerender(
      <KeyList
        {...propsMock}
        keysState={{
          ...propsMock.keysState,
          keys: [
            ...cloneDeep(propsMock).keysState.keys.map(({ name }) => ({
              name,
            })),
          ],
        }}
      />,
    )

    expect(queryAllByTestId(/ttl-loading/).length).toEqual(
      propsMock.keysState.keys.length,
    )
    expect(queryAllByTestId(/type-loading/).length).toEqual(
      propsMock.keysState.keys.length,
    )
    expect(queryAllByTestId(/size-loading/).length).toEqual(
      propsMock.keysState.keys.length,
    )
  })

  it('should call proper action after click on delete', async () => {
    const { container } = render(<KeyList {...propsMock} />)

    fireEvent.focus(
      container.querySelectorAll(
        '.ReactVirtualized__Table__row[role="row"]',
      )[0],
    )

    fireEvent.click(screen.getByTestId('delete-key-btn-key1'))
    fireEvent.click(screen.getByTestId('submit-delete-key'))

    const expectedActions = [deleteKey()]
    expect(clearStoreActions(store.getActions().slice(-1))).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('should refetch metadata when columns change', async () => {
    const spy = jest.spyOn(apiService, 'post')

    const keySelectorMocked = keysSelector as jest.Mock

    keySelectorMocked.mockReturnValue({
      ...mockedKeySlice,
      shownColumns: [],
    })

    const { rerender } = render(
      <KeyList
        {...propsMock}
        keysState={{
          ...propsMock.keysState,
          keys: [
            {
              name: {
                data: Buffer.from('test-key'),
                type: RedisResponseBufferType.Buffer,
              },
            },
          ],
        }}
      />,
    )

    keySelectorMocked.mockReturnValue({
      ...mockedKeySlice,
      shownColumns: [BrowserColumns.TTL],
    })

    rerender(
      <KeyList
        {...propsMock}
        keysState={{
          ...propsMock.keysState,
          keys: [
            {
              name: {
                data: Buffer.from('test-key'),
                type: RedisResponseBufferType.Buffer,
              },
            },
          ],
        }}
      />,
    )

    await waitFor(
      () => {
        expect(spy).toHaveBeenCalled()
      },
      { timeout: 1000 },
    )
  })

  it.each`
    columns                                      | description
    ${[]}                                        | ${'no columns are shown'}
    ${[BrowserColumns.TTL]}                      | ${'only TTL column is shown'}
    ${[BrowserColumns.Size]}                     | ${'only Size column is shown'}
    ${[BrowserColumns.TTL, BrowserColumns.Size]} | ${'both TTL and Size columns are shown'}
  `('should render DeleteKeyPopover when $description', ({ columns }) => {
    ;(keysSelector as jest.Mock).mockImplementation(() => ({
      ...mockedKeySlice,
      shownColumns: columns,
    }))

    const { container } = render(<KeyList {...propsMock} />)

    expect(
      container.querySelector(
        `[data-testid="delete-key-btn-${propsMock.keysState.keys[0].nameString}"]`,
      ),
    ).toBeInTheDocument()
  })

  describe('sorting', () => {
    beforeEach(() => {
      // Ensure bufferToString is used so key names render as plain strings
      mockedUseKeyFormatHandler.mockImplementation(bufferToString)
    })

    // Helper: returns key name testids in DOM order (from KeyRowName data-testid="key-{shortName}")
    const getKeyNamesInOrder = (container: HTMLElement): string[] =>
      Array.from(container.querySelectorAll('[data-testid^="key-"]'))
        .filter((el) => !el.getAttribute('data-testid')?.includes('key-row'))
        .map((el) => el.getAttribute('data-testid') ?? '')

    it('should sort rows by key name ascending', () => {
      const keys = [
        {
          name: {
            data: Buffer.from('keyC'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'keyC',
          type: 'hash',
          ttl: -1,
          size: 100,
        },
        {
          name: {
            data: Buffer.from('keyA'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'keyA',
          type: 'hash',
          ttl: -1,
          size: 150,
        },
        {
          name: {
            data: Buffer.from('keyB'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'keyB',
          type: 'hash',
          ttl: -1,
          size: 110,
        },
      ]

      const { container } = render(
        <KeyList
          {...propsMock}
          keysState={{ ...propsMock.keysState, keys }}
          sortedColumn={{ column: 'nameString', order: SortOrder.ASC }}
        />,
      )

      const keyNames = getKeyNamesInOrder(container)
      expect(keyNames[0]).toBe('key-keyA')
      expect(keyNames[1]).toBe('key-keyB')
      expect(keyNames[2]).toBe('key-keyC')
    })

    it('should sort rows by key name descending', () => {
      const keys = [
        {
          name: {
            data: Buffer.from('keyA'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'keyA',
          type: 'hash',
          ttl: -1,
          size: 100,
        },
        {
          name: {
            data: Buffer.from('keyC'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'keyC',
          type: 'hash',
          ttl: -1,
          size: 150,
        },
        {
          name: {
            data: Buffer.from('keyB'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'keyB',
          type: 'hash',
          ttl: -1,
          size: 110,
        },
      ]

      const { container } = render(
        <KeyList
          {...propsMock}
          keysState={{ ...propsMock.keysState, keys }}
          sortedColumn={{ column: 'nameString', order: SortOrder.DESC }}
        />,
      )

      const keyNames = getKeyNamesInOrder(container)
      expect(keyNames[0]).toBe('key-keyC')
      expect(keyNames[1]).toBe('key-keyB')
      expect(keyNames[2]).toBe('key-keyA')
    })

    it('should sort rows by size ascending', () => {
      const keys = [
        {
          name: {
            data: Buffer.from('key1'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key1',
          type: 'hash',
          ttl: -1,
          size: 300,
        },
        {
          name: {
            data: Buffer.from('key2'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key2',
          type: 'hash',
          ttl: -1,
          size: 100,
        },
        {
          name: {
            data: Buffer.from('key3'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key3',
          type: 'hash',
          ttl: -1,
          size: 200,
        },
      ]

      const { container } = render(
        <KeyList
          {...propsMock}
          keysState={{ ...propsMock.keysState, keys }}
          sortedColumn={{ column: 'size', order: SortOrder.ASC }}
        />,
      )

      const keyNames = getKeyNamesInOrder(container)
      expect(keyNames[0]).toBe('key-key2')
      expect(keyNames[1]).toBe('key-key3')
      expect(keyNames[2]).toBe('key-key1')
    })

    it('should sort rows by TTL descending', () => {
      const keys = [
        {
          name: {
            data: Buffer.from('key1'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key1',
          type: 'hash',
          ttl: 10,
          size: 100,
        },
        {
          name: {
            data: Buffer.from('key2'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key2',
          type: 'hash',
          ttl: 50,
          size: 100,
        },
        {
          name: {
            data: Buffer.from('key3'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key3',
          type: 'hash',
          ttl: 30,
          size: 100,
        },
      ]

      const { container } = render(
        <KeyList
          {...propsMock}
          keysState={{ ...propsMock.keysState, keys }}
          sortedColumn={{ column: 'ttl', order: SortOrder.DESC }}
        />,
      )

      const keyNames = getKeyNamesInOrder(container)
      expect(keyNames[0]).toBe('key-key2')
      expect(keyNames[1]).toBe('key-key3')
      expect(keyNames[2]).toBe('key-key1')
    })

    it('should place keys without size at the end when sorting by size', () => {
      const keys = [
        {
          name: {
            data: Buffer.from('key1'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key1',
          type: 'hash',
          ttl: -1,
          size: 200,
        },
        {
          name: {
            data: Buffer.from('key2'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key2',
          type: 'hash',
          ttl: -1,
          // no size — simulates a key whose metadata hasn't loaded yet
        },
        {
          name: {
            data: Buffer.from('key3'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key3',
          type: 'hash',
          ttl: -1,
          size: 100,
        },
      ]

      const { container } = render(
        <KeyList
          {...propsMock}
          keysState={{ ...propsMock.keysState, keys }}
          sortedColumn={{ column: 'size', order: SortOrder.ASC }}
        />,
      )

      const keyNames = getKeyNamesInOrder(container)
      expect(keyNames[0]).toBe('key-key3')
      expect(keyNames[1]).toBe('key-key1')
      expect(keyNames[2]).toBe('key-key2')
    })

    it('should place keys with ttl=-1 (No limit) at the end when sorting by TTL ascending', () => {
      const keys = [
        {
          name: {
            data: Buffer.from('key1'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key1',
          type: 'hash',
          ttl: -1,
          size: 100,
        },
        {
          name: {
            data: Buffer.from('key2'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key2',
          type: 'hash',
          ttl: 10,
          size: 100,
        },
        {
          name: {
            data: Buffer.from('key3'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key3',
          type: 'hash',
          ttl: 30,
          size: 100,
        },
      ]

      const { container } = render(
        <KeyList
          {...propsMock}
          keysState={{ ...propsMock.keysState, keys: keys as any }}
          sortedColumn={{ column: 'ttl', order: SortOrder.ASC }}
        />,
      )

      const keyNames = getKeyNamesInOrder(container)
      // key2(10) < key3(30) < key1(-1 → No limit, always last)
      expect(keyNames[0]).toBe('key-key2')
      expect(keyNames[1]).toBe('key-key3')
      expect(keyNames[2]).toBe('key-key1')
    })

    it('should place keys with ttl=-1 (No limit) at the end when sorting by TTL descending', () => {
      const keys = [
        {
          name: {
            data: Buffer.from('key1'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key1',
          type: 'hash',
          ttl: -1,
          size: 100,
        },
        {
          name: {
            data: Buffer.from('key2'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key2',
          type: 'hash',
          ttl: 10,
          size: 100,
        },
        {
          name: {
            data: Buffer.from('key3'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key3',
          type: 'hash',
          ttl: 30,
          size: 100,
        },
      ]

      const { container } = render(
        <KeyList
          {...propsMock}
          keysState={{ ...propsMock.keysState, keys: keys as any }}
          sortedColumn={{ column: 'ttl', order: SortOrder.DESC }}
        />,
      )

      const keyNames = getKeyNamesInOrder(container)
      // key3(30) > key2(10) > key1(-1 → No limit, always last)
      expect(keyNames[0]).toBe('key-key3')
      expect(keyNames[1]).toBe('key-key2')
      expect(keyNames[2]).toBe('key-key1')
    })

    it('should not corrupt list when some items already have metadata on fetch', async () => {
      // key2 already has metadata; key1 and key3 do not → only key1 & key3 are fetched.
      // The API response must be placed at the correct positions (0 and 2), not
      // contiguously from index 0 (which would overwrite key2 with key3 data).
      const keys = [
        {
          name: {
            data: Buffer.from('key1'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key1',
        },
        {
          name: {
            data: Buffer.from('key2'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key2',
          type: 'hash',
          ttl: -1,
          size: 200,
        },
        {
          name: {
            data: Buffer.from('key3'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key3',
        },
      ]

      // The mock mirrors the real API contract: returns only the requested keys,
      // in the order they were sent.
      const sizeByName: Record<string, number> = { key1: 100, key3: 300 }
      const apiServiceMock = jest
        .fn()
        .mockImplementation(async (_url: string, body: { keys: any[] }) => ({
          data: body.keys.map((key) => {
            const keyName = Buffer.from(key.data).toString()
            return {
              name: key,
              nameString: keyName,
              type: 'hash',
              ttl: -1,
              size: sizeByName[keyName],
            }
          }),
        }))
      apiService.post = apiServiceMock

      const { container } = render(
        <KeyList
          {...propsMock}
          keysState={{ ...propsMock.keysState, keys: keys as any }}
          sortedColumn={{ column: 'size', order: SortOrder.ASC }}
        />,
      )

      await waitFor(
        () => {
          expect(apiServiceMock).toHaveBeenCalled()
          const keyNames = getKeyNamesInOrder(container)
          // After metadata: key1(100), key2(200), key3(300) sorted ASC
          expect(keyNames[0]).toBe('key-key1')
          expect(keyNames[1]).toBe('key-key2')
          expect(keyNames[2]).toBe('key-key3')
        },
        { timeout: 500 },
      )
    })

    it('should maintain sort order when metadata loads asynchronously', async () => {
      // Keys have no type/size/length so metadata fetch is triggered
      const keys = [
        {
          name: {
            data: Buffer.from('key1'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key1',
        },
        {
          name: {
            data: Buffer.from('key2'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key2',
        },
        {
          name: {
            data: Buffer.from('key3'),
            type: RedisResponseBufferType.Buffer,
          },
          nameString: 'key3',
        },
      ]

      // Sizes are deliberately out of order to prove applySort re-runs correctly.
      // The mock mirrors the real API contract: returns only the requested keys,
      // in the order they were sent.
      const sizeByName: Record<string, number> = {
        key1: 300,
        key2: 100,
        key3: 200,
      }
      const apiServiceMock = jest
        .fn()
        .mockImplementation(async (_url: string, body: { keys: any[] }) => ({
          data: body.keys.map((key) => {
            const keyName = Buffer.from(key.data).toString()
            return {
              name: key,
              nameString: keyName,
              type: 'hash',
              ttl: -1,
              size: sizeByName[keyName],
            }
          }),
        }))
      apiService.post = apiServiceMock

      const { container } = render(
        <KeyList
          {...propsMock}
          keysState={{ ...propsMock.keysState, keys: keys as any }}
          sortedColumn={{ column: 'size', order: SortOrder.ASC }}
        />,
      )

      await waitFor(
        () => {
          expect(apiServiceMock).toHaveBeenCalled()
          const keyNames = getKeyNamesInOrder(container)
          // After metadata arrives, applySort should re-run: key2(100) < key3(200) < key1(300)
          expect(keyNames[0]).toBe('key-key2')
          expect(keyNames[1]).toBe('key-key3')
          expect(keyNames[2]).toBe('key-key1')
        },
        { timeout: 500 },
      )
    })

    it('should re-fetch metadata when sortedColumn changes', async () => {
      const apiServiceMock = jest
        .fn()
        .mockResolvedValue(cloneDeep(propsMock.keysState.keys))
      apiService.post = apiServiceMock

      const { rerender } = render(
        <KeyList
          {...propsMock}
          keysState={{
            ...propsMock.keysState,
            keys: propsMock.keysState.keys.map(({ name, nameString }) => ({
              name,
              nameString,
            })),
          }}
          sortedColumn={null}
        />,
      )

      apiServiceMock.mockClear()

      rerender(
        <KeyList
          {...propsMock}
          keysState={{
            ...propsMock.keysState,
            keys: propsMock.keysState.keys.map(({ name, nameString }) => ({
              name,
              nameString,
            })),
          }}
          sortedColumn={{ column: 'nameString', order: SortOrder.ASC }}
        />,
      )

      await waitFor(
        () => {
          expect(apiServiceMock).toHaveBeenCalled()
        },
        { timeout: 500 },
      )
    })
  })
})
