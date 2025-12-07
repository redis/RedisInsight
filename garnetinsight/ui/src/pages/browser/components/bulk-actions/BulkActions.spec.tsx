import React from 'react'
import { useSelector } from 'react-redux'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'

import {
  cleanup,
  mockedStore,
  render,
  screen,
  fireEvent,
} from 'uiSrc/utils/test-utils'
import { RootState } from 'uiSrc/slices/store'
import { BulkActionsType, KeyTypes } from 'uiSrc/constants'
import { setBulkActionType } from 'uiSrc/slices/browser/bulkActions'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import BulkActions, { Props } from './BulkActions'

const mockedProps = {
  ...mock<Props>(),
}
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/browser/bulkActions', () => ({
  ...jest.requireActual('uiSrc/slices/browser/bulkActions'),
  selectedBulkActionsSelector: jest.fn().mockReturnValue({
    type: 'delete',
  }),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}))

beforeEach(() => {
  const state: any = store.getState()

  ;(useSelector as jest.Mock).mockImplementation(
    (callback: (arg0: RootState) => RootState) =>
      callback({
        ...state,
        browser: {
          ...state.browser,
          keys: {
            ...state.browser.keys,
          },
        },
      }),
  )
})

describe('BulkActions', () => {
  it('should render', () => {
    expect(render(<BulkActions {...mockedProps} />)).toBeTruthy()
  })

  it('placeholder should render', () => {
    render(<BulkActions {...mockedProps} />)

    expect(screen.queryByTestId('bulk-actions-placeholder')).toBeInTheDocument()
    expect(screen.queryByTestId('bulk-actions-info')).not.toBeInTheDocument()
  })

  it('bulk actions summary should render with any search', () => {
    const state: any = store.getState()

    ;(useSelector as jest.Mock).mockImplementation(
      (callback: (arg0: any) => any) =>
        callback({
          ...state,
          browser: {
            ...state.browser,
            keys: {
              ...state.browser.keys,
              search: '1',
              isSearched: true,
            },
          },
        }),
    )

    render(<BulkActions {...mockedProps} />)

    expect(screen.queryByTestId('bulk-actions-info')).toBeInTheDocument()
    expect(
      screen.queryByTestId('bulk-actions-placeholder'),
    ).not.toBeInTheDocument()
  })

  it('bulk actions summary should render with any filter', () => {
    const state: any = store.getState()

    ;(useSelector as jest.Mock).mockImplementation(
      (callback: (arg0: any) => any) =>
        callback({
          ...state,
          browser: {
            ...state.browser,
            keys: {
              ...state.browser.keys,
              filter: KeyTypes.Hash,
              isFiltered: true,
            },
          },
        }),
    )

    render(<BulkActions {...mockedProps} />)

    expect(screen.queryByTestId('bulk-actions-info')).toBeInTheDocument()
    expect(
      screen.queryByTestId('bulk-actions-placeholder'),
    ).not.toBeInTheDocument()
  })

  it('should call proper event after switch tab', async () => {
    render(<BulkActions {...mockedProps} />)

    fireEvent.mouseDown(screen.getByText('Upload Data'))

    const expectedActions = [setBulkActionType(BulkActionsType.Upload)]
    expect(store.getActions()).toEqual(expectedActions)
  })

  describe('Telemetry', () => {
    it('should call proper telemetry events', async () => {
      const state: any = store.getState()
      ;(useSelector as jest.Mock).mockImplementation(
        (callback: (arg0: any) => any) =>
          callback({
            ...state,
            browser: {
              ...state.browser,
              keys: {
                ...state.browser.keys,
                filter: KeyTypes.Hash,
                isFiltered: true,
              },
            },
          }),
      )
      const sendEventTelemetryMock = jest.fn()
      ;(sendEventTelemetry as jest.Mock).mockImplementation(
        () => sendEventTelemetryMock,
      )

      render(
        <BulkActions
          {...mockedProps}
          onBulkActionsPanel={jest.fn()}
          onClosePanel={jest.fn()}
        />,
      )

      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.BULK_ACTIONS_OPENED,
        eventData: {
          databaseId: 'instanceId',
          filter: {
            match: '*',
            filter: 'hash',
          },
          action: 'delete',
        },
      })
      ;(sendEventTelemetry as jest.Mock).mockRestore()

      fireEvent.click(screen.getByTestId('bulk-action-cancel-btn'))

      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.BULK_ACTIONS_CANCELLED,
        eventData: {
          databaseId: 'instanceId',
          action: BulkActionsType.Delete,
          filter: {
            match: '*',
            type: 'hash',
          },
        },
      })
    })
  })
})
