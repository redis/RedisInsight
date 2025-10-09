import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { DEFAULT_DELIMITER, SortOrder } from 'uiSrc/constants'
import {
  resetBrowserTree,
  setBrowserTreeDelimiter,
  setBrowserTreeSort,
} from 'uiSrc/slices/app/context'
import {
  cleanup,
  clearStoreActions,
  fireEvent,
  mockedStore,
  render,
  screen,
  act,
  waitForRiPopoverVisible,
  waitForRedisUiSelectVisible,
  userEvent,
} from 'uiSrc/utils/test-utils'

import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { comboBoxToArray } from 'uiSrc/utils'
import KeyTreeSettings, { Props } from './KeyTreeSettings'

const mockedProps = mock<Props>()
let store: typeof mockedStore
const APPLY_BTN = 'tree-view-apply-btn'
const TREE_SETTINGS_TRIGGER_BTN = 'tree-view-settings-btn'
const SORTING_SELECT = 'tree-view-sorting-select'
const SORTING_DESC_ITEM = 'tree-view-sorting-item-DESC'

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('KeyTreeDelimiter', () => {
  it('should render', () => {
    expect(render(<KeyTreeSettings {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('Settings button should be rendered', () => {
    render(<KeyTreeSettings {...instance(mockedProps)} />)

    expect(screen.getByTestId(TREE_SETTINGS_TRIGGER_BTN)).toBeInTheDocument()
  })

  it('Delimiter input and Sorting selector should be rendered after click on button', async () => {
    render(<KeyTreeSettings {...instance(mockedProps)} />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(TREE_SETTINGS_TRIGGER_BTN))
    })
    await waitForRiPopoverVisible()

    const comboboxInput = document.querySelector(
      '[data-testid="delimiter-combobox"] [data-test-subj="autoTagInput"]',
    ) as HTMLInputElement

    expect(comboboxInput).toBeInTheDocument()
    expect(screen.getByTestId(SORTING_SELECT)).toBeInTheDocument()
  })

  it('"setBrowserTreeDelimiter" and "setBrowserTreeSort" should be called after Apply change delimiter', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    const value = 'val'
    render(<KeyTreeSettings {...instance(mockedProps)} />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(TREE_SETTINGS_TRIGGER_BTN))
    })

    await waitForRiPopoverVisible()

    const comboboxInput = document.querySelector(
      '[data-testid="delimiter-combobox"] [data-test-subj="autoTagInput"]',
    ) as HTMLInputElement

    fireEvent.change(comboboxInput, { target: { value } })

    fireEvent.keyDown(comboboxInput, { key: 'Enter', code: 13, charCode: 13 })

    const containerLabels = document.querySelector(
      '[data-test-subj="autoTagWrapper"]',
    )!
    expect(
      containerLabels.querySelector(`[title="${value}"]`),
    ).toBeInTheDocument()

    fireEvent.click(
      containerLabels.querySelector('[data-test-subj="autoTagChip"] button')!,
    )
    expect(containerLabels.querySelector('[title=":"]')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTestId(SORTING_SELECT))

    await waitForRedisUiSelectVisible()

    await userEvent.click(screen.getByTestId(SORTING_DESC_ITEM))
    ;(sendEventTelemetry as jest.Mock).mockRestore()

    await act(async () => {
      fireEvent.click(screen.getByTestId(APPLY_BTN))
    })

    const expectedActions = [
      setBrowserTreeDelimiter([{ label: value }]),
      resetBrowserTree(),
      setBrowserTreeSort(SortOrder.DESC),
      resetBrowserTree(),
    ]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.TREE_VIEW_DELIMITER_CHANGED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        from: comboBoxToArray([DEFAULT_DELIMITER]),
        to: [value],
      },
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.TREE_VIEW_KEYS_SORTED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        sorting: SortOrder.DESC,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('"setBrowserTreeDelimiter" should be called with DEFAULT_DELIMITER after Apply change with empty input', async () => {
    render(<KeyTreeSettings {...instance(mockedProps)} />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(TREE_SETTINGS_TRIGGER_BTN))
    })

    await waitForRiPopoverVisible()

    const containerLabels = document.querySelector(
      '[data-test-subj="autoTagWrapper"]',
    )!
    fireEvent.click(
      containerLabels.querySelector('[data-test-subj="autoTagChip"] button')!,
    )
    expect(
      containerLabels.querySelector('[data-test-subj="autoTagChip"]'),
    ).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId(APPLY_BTN))
    })

    const expectedActions = [
      setBrowserTreeDelimiter([DEFAULT_DELIMITER]),
      resetBrowserTree(),
    ]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('should handle pending input when Apply is clicked without pressing Enter', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    const pendingValue = 'newDelimiter'
    render(<KeyTreeSettings {...instance(mockedProps)} />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(TREE_SETTINGS_TRIGGER_BTN))
    })

    await waitForRiPopoverVisible()

    const comboboxInput = document.querySelector(
      '[data-testid="delimiter-combobox"] [data-test-subj="autoTagInput"]',
    ) as HTMLInputElement

    // Type in the input but don't press Enter
    fireEvent.change(comboboxInput, { target: { value: pendingValue } })

    // Verify the input has the value but no tag is created yet
    expect(comboboxInput.value).toBe(pendingValue)
    const containerLabels = document.querySelector(
      '[data-test-subj="autoTagWrapper"]',
    )!
    expect(
      containerLabels.querySelector(`[title="${pendingValue}"]`),
    ).not.toBeInTheDocument()

    // Click Apply - this should handle the pending input
    await act(async () => {
      fireEvent.click(screen.getByTestId(APPLY_BTN))
    })

    const expectedActions = [
      setBrowserTreeDelimiter([DEFAULT_DELIMITER, { label: pendingValue }]),
      resetBrowserTree(),
    ]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.TREE_VIEW_DELIMITER_CHANGED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        from: comboBoxToArray([DEFAULT_DELIMITER]),
        to: comboBoxToArray([DEFAULT_DELIMITER, { label: pendingValue }]),
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should not handle pending input when it is empty or whitespace only', async () => {
    render(<KeyTreeSettings {...instance(mockedProps)} />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(TREE_SETTINGS_TRIGGER_BTN))
    })

    await waitForRiPopoverVisible()

    const comboboxInput = document.querySelector(
      '[data-testid="delimiter-combobox"] [data-test-subj="autoTagInput"]',
    ) as HTMLInputElement

    // Type whitespace only
    fireEvent.change(comboboxInput, { target: { value: '   ' } })

    // Click Apply - this should not handle the pending input
    await act(async () => {
      fireEvent.click(screen.getByTestId(APPLY_BTN))
    })

    // Should not dispatch any actions since no changes were made
    expect(store.getActions()).toEqual([])
  })

  it('should clear pending input after successful Apply', async () => {
    const pendingValue = 'testDelimiter'
    render(<KeyTreeSettings {...instance(mockedProps)} />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(TREE_SETTINGS_TRIGGER_BTN))
    })

    await waitForRiPopoverVisible()

    const comboboxInput = document.querySelector(
      '[data-testid="delimiter-combobox"] [data-test-subj="autoTagInput"]',
    ) as HTMLInputElement

    // Type in the input
    fireEvent.change(comboboxInput, { target: { value: pendingValue } })
    expect(comboboxInput.value).toBe(pendingValue)

    // Click Apply
    await act(async () => {
      fireEvent.click(screen.getByTestId(APPLY_BTN))
    })

    // Open the popover again to check if input is cleared
    await act(async () => {
      fireEvent.click(screen.getByTestId(TREE_SETTINGS_TRIGGER_BTN))
    })

    await waitForRiPopoverVisible()

    const comboboxInputAfter = document.querySelector(
      '[data-testid="delimiter-combobox"] [data-test-subj="autoTagInput"]',
    ) as HTMLInputElement

    // Input should be cleared after Apply
    expect(comboboxInputAfter.value).toBe('')
  })
})
