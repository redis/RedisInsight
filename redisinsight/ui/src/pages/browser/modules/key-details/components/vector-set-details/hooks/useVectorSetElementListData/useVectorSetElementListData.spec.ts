import {
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import {
  vectorSetDataSelector,
  vectorSetSelector,
} from 'uiSrc/slices/browser/vectorSet'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { KeyValueFormat } from 'uiSrc/constants'
import { act, mockedStore, renderHook } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'

import { VectorSetActionsConfig } from '../../vector-set-element-list/VectorSetElementList.types'
import { useVectorSetElementListData } from './useVectorSetElementListData'

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeyDataSelector: jest.fn(),
  selectedKeySelector: jest.fn(),
}))

jest.mock('uiSrc/slices/browser/vectorSet', () => ({
  ...jest.requireActual('uiSrc/slices/browser/vectorSet'),
  vectorSetSelector: jest.fn(),
  vectorSetDataSelector: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn(),
}))

const KEY_A = stringToBuffer('keyA')

const mockedSelectedKeyDataSelector = jest.mocked(selectedKeyDataSelector)
const mockedSelectedKeySelector = jest.mocked(selectedKeySelector)
const mockedVectorSetSelector = jest.mocked(vectorSetSelector)
const mockedVectorSetDataSelector = jest.mocked(vectorSetDataSelector)
const mockedConnectedInstanceSelector = jest.mocked(connectedInstanceSelector)

const buildActionsConfig = (): VectorSetActionsConfig => ({
  elementDeleteConfig: {
    deleting: '',
    suffix: '_vectorSet',
    total: 0,
    keyName: '',
    closePopover: jest.fn(),
    showPopover: jest.fn(),
    handleDeleteElement: jest.fn(),
    handleRemoveIconClick: jest.fn(),
  },
  onViewElement: jest.fn(),
  onSearchByElement: jest.fn(),
})

const setKey = (name: typeof KEY_A | null) => {
  mockedSelectedKeyDataSelector.mockReturnValue(
    (name ? { name } : null) as ReturnType<typeof selectedKeyDataSelector>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  mockedStore.clearActions()
  setKey(KEY_A)
  mockedSelectedKeySelector.mockReturnValue({
    viewFormat: KeyValueFormat.JSON,
  } as ReturnType<typeof selectedKeySelector>)
  mockedVectorSetSelector.mockReturnValue({
    loading: false,
  } as ReturnType<typeof vectorSetSelector>)
  mockedVectorSetDataSelector.mockReturnValue({
    elements: [],
    total: 0,
    isPaginationSupported: true,
    nextCursor: undefined,
  } as unknown as ReturnType<typeof vectorSetDataSelector>)
  mockedConnectedInstanceSelector.mockReturnValue({
    compressor: null,
  } as unknown as ReturnType<typeof connectedInstanceSelector>)
})

describe('useVectorSetElementListData', () => {
  it('exposes meta combining selectors and the provided actionsConfig', () => {
    const actionsConfig = buildActionsConfig()
    const { result } = renderHook(() =>
      useVectorSetElementListData({ actionsConfig }),
    )

    expect(result.current.meta).toEqual({
      compressor: null,
      viewFormat: KeyValueFormat.JSON,
      actionsConfig,
    })
  })

  it('returns a paginated slice of the elements according to current page', () => {
    const elements = Array.from({ length: 7 }, (_, i) => ({
      name: stringToBuffer(`el-${i}`),
    }))
    mockedVectorSetDataSelector.mockReturnValue({
      elements,
      total: elements.length,
      isPaginationSupported: true,
      nextCursor: undefined,
    } as unknown as ReturnType<typeof vectorSetDataSelector>)

    const actionsConfig = buildActionsConfig()
    const { result } = renderHook(() =>
      useVectorSetElementListData({ actionsConfig }),
    )

    act(() => {
      result.current.setPagination({ pageIndex: 0, pageSize: 5 })
    })
    expect(result.current.currentPageData).toHaveLength(5)

    act(() => {
      result.current.setPagination({ pageIndex: 1, pageSize: 5 })
    })
    expect(result.current.currentPageData).toHaveLength(2)
  })
})
