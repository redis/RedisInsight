import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import {
  deleteVectorSetElements,
  vectorSetDataSelector,
} from 'uiSrc/slices/browser/vectorSet'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { act, mockedStore, renderHook } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'

import { useVectorSetActionsConfig } from './useVectorSetActionsConfig'

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeyDataSelector: jest.fn(),
}))

jest.mock('uiSrc/slices/browser/vectorSet', () => ({
  ...jest.requireActual('uiSrc/slices/browser/vectorSet'),
  vectorSetDataSelector: jest.fn(),
  deleteVectorSetElements: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn(),
}))

const KEY_A = stringToBuffer('keyA')

const mockedSelectedKeyDataSelector = jest.mocked(selectedKeyDataSelector)
const mockedVectorSetDataSelector = jest.mocked(vectorSetDataSelector)
const mockedConnectedInstanceSelector = jest.mocked(connectedInstanceSelector)
const mockedDeleteVectorSetElements = jest.mocked(deleteVectorSetElements)

const setKey = (name: typeof KEY_A | null) => {
  mockedSelectedKeyDataSelector.mockReturnValue(
    (name ? { name } : null) as ReturnType<typeof selectedKeyDataSelector>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  mockedStore.clearActions()
  setKey(KEY_A)
  mockedVectorSetDataSelector.mockReturnValue({
    total: 3,
  } as ReturnType<typeof vectorSetDataSelector>)
  mockedConnectedInstanceSelector.mockReturnValue({
    id: 'db-1',
  } as ReturnType<typeof connectedInstanceSelector>)
  mockedDeleteVectorSetElements.mockReturnValue({
    type: 'vectorSet/deleteVectorSetElements',
  } as unknown as ReturnType<typeof deleteVectorSetElements>)
})

describe('useVectorSetActionsConfig', () => {
  it('wires the supplied onViewElement into actionsConfig', () => {
    const onViewElement = jest.fn()
    const { result } = renderHook(() =>
      useVectorSetActionsConfig({ onRemoveKey: jest.fn(), onViewElement }),
    )

    expect(result.current.actionsConfig.onViewElement).toBe(onViewElement)
  })

  it('sets the similarity-search prefill scoped to the current key on Find-similar', () => {
    const { result } = renderHook(() =>
      useVectorSetActionsConfig({
        onRemoveKey: jest.fn(),
        onViewElement: jest.fn(),
      }),
    )

    expect(result.current.similarityPrefill).toBeUndefined()

    act(() => {
      result.current.actionsConfig.onSearchByElement({
        name: stringToBuffer('foo'),
      })
    })

    expect(result.current.similarityPrefill).toEqual({
      value: 'foo',
      nonce: 1,
    })
  })

  it('bumps the prefill nonce on each Find-similar click', () => {
    const { result } = renderHook(() =>
      useVectorSetActionsConfig({
        onRemoveKey: jest.fn(),
        onViewElement: jest.fn(),
      }),
    )

    act(() => {
      result.current.actionsConfig.onSearchByElement({
        name: stringToBuffer('foo'),
      })
    })
    act(() => {
      result.current.actionsConfig.onSearchByElement({
        name: stringToBuffer('foo'),
      })
    })

    expect(result.current.similarityPrefill).toEqual({
      value: 'foo',
      nonce: 2,
    })
  })

  it('dispatches deleteVectorSetElements when handleDeleteElement is invoked', () => {
    const { result } = renderHook(() =>
      useVectorSetActionsConfig({
        onRemoveKey: jest.fn(),
        onViewElement: jest.fn(),
      }),
    )

    act(() => {
      result.current.actionsConfig.elementDeleteConfig.handleDeleteElement(
        'foo',
      )
    })

    expect(mockedDeleteVectorSetElements).toHaveBeenCalledTimes(1)
    expect(mockedDeleteVectorSetElements.mock.calls[0][0]).toBe(KEY_A)
  })
})
