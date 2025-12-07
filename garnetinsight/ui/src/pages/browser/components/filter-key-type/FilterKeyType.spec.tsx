import { cloneDeep, set } from 'lodash'
import React from 'react'
import {
  cleanup,
  expectActionsToContain,
  fireEvent,
  initialStateDefault,
  mockedStore,
  mockStore,
  render,
  screen,
  userEvent,
} from 'uiSrc/utils/test-utils'
import { loadKeys, setFilter } from 'uiSrc/slices/browser/keys'
import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import { FeatureFlags, KeyTypes } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import FilterKeyType from './FilterKeyType'
import { resetBrowserTree } from 'uiSrc/slices/app/context'

let store: typeof mockedStore

const filterSelectId = 'select-filter-key-type'
const unsupportedAnchorId = 'unsupported-btn-anchor'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceOverviewSelector: jest.fn().mockReturnValue({
    version: '6.2.1',
  }),
  connectedInstanceSelector: jest.fn().mockReturnValue({ id: '123' }),
}))

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('FilterKeyType', () => {
  it('should render', () => {
    expect(render(<FilterKeyType />)).toBeTruthy()
    const searchInput = screen.getByTestId(filterSelectId)
    expect(searchInput).toBeInTheDocument()
  })

  it('should not be disabled filter with database redis version > 6.0', () => {
    render(<FilterKeyType />)
    const filterSelect = screen.getByTestId(filterSelectId)

    expect(filterSelect).not.toBeDisabled()
  })

  it('should not be info anchor with database redis version > 6.0', () => {
    const { queryByTestId } = render(<FilterKeyType />)
    expect(queryByTestId(unsupportedAnchorId)).not.toBeInTheDocument()
  })

  it('"setFilter" and "loadKeys" should be called after select "Hash" type', async () => {
    const { findByText } = render(<FilterKeyType />)

    await userEvent.click(screen.getByTestId(filterSelectId))
    await userEvent.click(await findByText('Hash'))

    const expectedActions = [
      setFilter(KeyTypes.Hash),
      resetBrowserTree(),
      loadKeys(),
    ]

    expectActionsToContain(store.getActions(), expectedActions)
  })

  it('should be disabled filter with database redis version < 6.0', () => {
    connectedInstanceOverviewSelector.mockImplementationOnce(() => ({
      version: '5.1',
    }))
    render(<FilterKeyType />)
    const filterSelect = screen.getByTestId(filterSelectId)

    expect(filterSelect).toBeDisabled()
  })

  it('should be info box with database redis version < 6.0', () => {
    connectedInstanceOverviewSelector.mockImplementationOnce(() => ({
      version: '5.1',
    }))
    render(<FilterKeyType />)
    expect(screen.getByTestId(unsupportedAnchorId)).toBeInTheDocument()

    fireEvent.click(screen.getByTestId(unsupportedAnchorId))

    expect(screen.getByTestId('filter-not-available-modal')).toBeInTheDocument()
  })

  it('should send telemetry event with redis v < 6.0 after click on anchor', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)
    connectedInstanceOverviewSelector.mockImplementationOnce(() => ({
      version: '5.1',
    }))

    render(<FilterKeyType />)

    fireEvent.click(screen.getByTestId(unsupportedAnchorId))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.BROWSER_FILTER_MODE_CHANGE_FAILED,
      eventData: {
        databaseId: 'instanceId',
      },
    })
  })

  it('should filter out graph if redis db does not have graph module', () => {
    const { queryByText } = render(<FilterKeyType modules={[]} />)

    fireEvent.click(screen.getByTestId(filterSelectId))

    const graphElement = queryByText('Graph')
    expect(graphElement).not.toBeInTheDocument()
  })

  it('should not filter out items if required feature flags are set to true', async () => {
    const { queryByText } = render(
      <FilterKeyType
        modules={[
          {
            name: RedisDefaultModules.Graph,
            version: 1,
            semanticVersion: '1.3',
          },
        ]}
      />,
    )

    await userEvent.click(screen.getByTestId(filterSelectId))

    const graphElement = queryByText('Graph')
    expect(graphElement).toBeInTheDocument()
  })

  it('should filter out items if required feature flags are not set to true', () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )
    const { queryByText } = render(<FilterKeyType />, {
      store: mockStore(initialStoreState),
    })

    fireEvent.click(screen.getByTestId(filterSelectId))

    const graphElement = queryByText('Graph')
    expect(graphElement).not.toBeInTheDocument()
  })
})
