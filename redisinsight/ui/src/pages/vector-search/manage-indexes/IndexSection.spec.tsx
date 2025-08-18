import React from 'react'
import { Provider } from 'react-redux'
import { rest } from 'msw'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { mswServer } from 'uiSrc/mocks/server'
import {
  cleanup,
  render,
  screen,
  initialStateDefault,
  userEvent,
  getMswURL,
  waitForRiPopoverVisible,
  fireEvent,
} from 'uiSrc/utils/test-utils'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import Notifications from 'uiSrc/components/notifications'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl } from 'uiSrc/utils'
import { RootState } from 'uiSrc/slices/store'
import notificationsReducer from 'uiSrc/slices/app/notifications'
import appInfoReducer from 'uiSrc/slices/app/info'
import redisearchReducer from 'uiSrc/slices/browser/redisearch'
import instancesReducer from 'uiSrc/slices/instances/instances'
import {
  indexInfoAttributeFactory,
  indexInfoFactory,
} from 'uiSrc/mocks/factories/redisearch/IndexInfo.factory'
import { IndexInfoDto } from 'apiSrc/modules/browser/redisearch/dto'
import { IndexSection, IndexSectionProps } from './IndexSection'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const createTestStore = () => {
  // TODO: Use rootReducer instead, once you realize how to solve the issue with the instancesReducer
  // console.error No reducer provided for key "instances"
  // > 81 |   connections: combineReducers({
  const testReducer = combineReducers({
    app: combineReducers({
      notifications: notificationsReducer,
      info: appInfoReducer,
    }),
    browser: combineReducers({
      redisearch: redisearchReducer,
    }),
    connections: combineReducers({
      instances: instancesReducer,
    }),
  })

  const testState: RootState = {
    ...initialStateDefault,

    connections: {
      ...initialStateDefault.connections,
      instances: {
        ...initialStateDefault.connections.instances,
        connectedInstance: {
          ...initialStateDefault.connections.instances.connectedInstance,
          id: INSTANCE_ID_MOCK,
          name: 'test-instance',
          host: 'localhost',
          port: 6379,
          modules: [],
        },
      },
    },
  }

  return configureStore({
    reducer: testReducer,
    preloadedState: testState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  })
}

const renderComponent = (props?: Partial<IndexSectionProps>) => {
  const defaultProps: IndexSectionProps = {
    index: 'test-index',
  }

  const store = createTestStore()

  return render(
    <Provider store={store}>
      <IndexSection {...defaultProps} {...props} />
      <Notifications />
    </Provider>,
  )
}

describe('IndexSection', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  afterEach(() => {
    mswServer.resetHandlers()
  })

  it('should render', async () => {
    const props: IndexSectionProps = {
      index: 'test-index',
    }

    const { container } = renderComponent(props)
    expect(container).toBeTruthy()

    const section = screen.getByTestId(
      `manage-indexes-list--item--${props.index}`,
    )
    expect(section).toBeInTheDocument()

    // Verify index name is formatted correctly
    const indexName = screen.getByText('test-index')
    expect(indexName).toBeInTheDocument()
  })

  it('should display index summary when collapsed', async () => {
    const mockIndexInfo = indexInfoFactory.build()
    const props: IndexSectionProps = {
      index: mockIndexInfo.index_name,
    }

    // Override the MSW handler to return an error for this test
    mswServer.use(
      rest.post<IndexInfoDto>(
        getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.REDISEARCH_INFO)),
        async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockIndexInfo)),
      ),
    )

    renderComponent(props)

    const section = screen.getByTestId(
      `manage-indexes-list--item--${props.index}`,
    )
    expect(section).toBeInTheDocument()

    // Verify index name is formatted correctly
    const indexName = screen.getByText(mockIndexInfo.index_name)
    expect(indexName).toBeInTheDocument()

    // Verify the index summary info is displayed
    const recordsLabel = screen.getByText('Records')
    const recordsValue = await screen.findByText(mockIndexInfo.num_records!)

    expect(recordsLabel).toBeInTheDocument()
    expect(recordsValue).toBeInTheDocument()

    const termsLabel = screen.getByText('Terms')
    const termsValue = await screen.findByText(mockIndexInfo.num_terms!)

    expect(termsLabel).toBeInTheDocument()
    expect(termsValue).toBeInTheDocument()

    const fieldsLabel = screen.getByText('Fields')
    const fieldsValue = await screen.findByText(
      mockIndexInfo.attributes.length.toString(),
    )

    expect(fieldsLabel).toBeInTheDocument()
    expect(fieldsValue).toBeInTheDocument()
  })

  it('should display index attributes when expanded', async () => {
    const mockIndexAttribute = indexInfoAttributeFactory.build(
      {},
      { transient: { includeWeight: true, includeNoIndex: true } },
    )
    const mockIndexInfo = indexInfoFactory.build({
      attributes: [mockIndexAttribute],
    })
    const props: IndexSectionProps = {
      index: mockIndexInfo.index_name,
    }

    // Override the MSW handler to return an error for this test
    mswServer.use(
      rest.post<IndexInfoDto>(
        getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.REDISEARCH_INFO)),
        async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockIndexInfo)),
      ),
    )

    const { container } = renderComponent(props)

    // Verify index name is formatted correctly
    const indexName = screen.getByText(props.index as string)
    expect(indexName).toBeInTheDocument()

    // Click to expand the section
    await userEvent.click(indexName)

    // Verify the index attributes are displayed
    const identifier = await screen.findByText('Identifier')
    const attribute = await screen.findByText('Attribute')
    const type = await screen.findByText('Type')
    const weight = await screen.findByText('Weight')
    const noindex = await screen.findByText('Noindex')

    expect(identifier).toBeInTheDocument()
    expect(attribute).toBeInTheDocument()
    expect(type).toBeInTheDocument()
    expect(weight).toBeInTheDocument()
    expect(noindex).toBeInTheDocument()

    // Verify that data rows are rendered
    const regularRows = container.querySelectorAll(
      'tr[data-row-type="regular"]',
    )
    expect(regularRows.length).toBe(mockIndexInfo.attributes.length)

    // Verify their values as well
    const identifierValue = await screen.findByText(
      mockIndexAttribute.identifier,
    )
    const attributeValue = await screen.findByText(mockIndexAttribute.attribute)
    const typeValue = await screen.findAllByText(mockIndexAttribute.type)
    const weightValue = await screen.findAllByText(mockIndexAttribute.WEIGHT!)
    const noIndexValue = await screen.findAllByTestId(
      'index-attributes-list--noindex-icon',
    )

    expect(identifierValue).toBeInTheDocument()
    expect(attributeValue).toBeInTheDocument()
    expect(typeValue[0]).toBeInTheDocument()
    expect(weightValue[0]).toBeInTheDocument()
    expect(noIndexValue[0]).toBeInTheDocument()
  })

  it('should send telemetry when expanding and collapsing the section information', async () => {
    const mockIndexInfo = indexInfoFactory.build()
    const props: IndexSectionProps = {
      index: mockIndexInfo.index_name,
    }

    renderComponent(props)

    const section = screen.getByTestId(
      `manage-indexes-list--item--${props.index}`,
    )
    expect(section).toBeInTheDocument()

    // Verify we start with collapsed section with summary info and no index details
    const indexSummaryInitial = screen.getByText('Records')
    const indexDetailsInitial = screen.queryByText('Identifier')

    expect(indexSummaryInitial).toBeInTheDocument()
    expect(indexDetailsInitial).not.toBeInTheDocument()

    // Click to expand the section
    const indexName = screen.getByText(mockIndexInfo.index_name)
    expect(indexName).toBeInTheDocument()

    fireEvent.click(indexName)

    // Verify the index attributes are displayed and
    const indexDetailsExpanded = await screen.findByText('Identifier')
    expect(indexDetailsExpanded).toBeInTheDocument()

    // Verify the telemetry event is sent
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MANAGE_INDEX_DETAILS_OPENED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
      },
    })

    // Click again to collapse the section
    fireEvent.click(indexName)

    // Verify the index summary info is displayed again
    const indexSummaryVisible = screen.getByText('Records')
    const indexDetailsCollapsed = screen.queryByText('Identifier')

    expect(indexSummaryVisible).toBeInTheDocument()
    expect(indexDetailsCollapsed).not.toBeInTheDocument()

    // Verify the telemetry event is sent
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MANAGE_INDEX_DETAILS_CLOSED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
      },
    })
  })

  describe('delete index', () => {
    let telemetryMock: jest.Mock

    beforeEach(() => {
      // Mock the telemetry function
      telemetryMock = sendEventTelemetry as jest.Mock
      telemetryMock.mockClear()
    })

    afterEach(() => {
      mswServer.resetHandlers()
    })

    it('should delete an index when the delete button is clicked and confirmed', async () => {
      renderComponent()

      // Trigger confirm dialog
      const deleteButton = screen.getByTestId('manage-index-delete-btn')
      expect(deleteButton).toBeInTheDocument()
      fireEvent.click(deleteButton)

      // Confirm dialog is visible
      await waitForRiPopoverVisible()
      expect(
        screen.getByText('Are you sure you want to delete this index?'),
      ).toBeInTheDocument()

      // Confirm actual delete
      const confirmDeleteButton = screen.getByTestId(
        'manage-index-delete-confirmation-btn',
      )
      expect(confirmDeleteButton).toBeInTheDocument()
      fireEvent.click(confirmDeleteButton)

      // Wait for the success notification to appear
      const successNotification = await screen.findByText(
        'Index has been deleted',
      )
      expect(successNotification).toBeInTheDocument()

      // Verify the telemetry event is sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_MANAGE_INDEX_DELETED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
        },
      })
    })

    it('should handle deletion failure gracefully', async () => {
      // Override the MSW handler to return an error for this test
      mswServer.use(
        rest.delete(
          getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.REDISEARCH)),
          async (_req, res, ctx) =>
            res(
              ctx.status(500),
              ctx.json({
                error: 'Internal Server Error',
                statusCode: 500,
                message: 'Failed to delete index',
              }),
            ),
        ),
      )

      renderComponent()

      // Trigger confirm dialog
      const deleteButton = screen.getByTestId('manage-index-delete-btn')
      expect(deleteButton).toBeInTheDocument()
      fireEvent.click(deleteButton)

      // Confirm dialog is visible
      await waitForRiPopoverVisible()
      expect(
        screen.getByText('Are you sure you want to delete this index?'),
      ).toBeInTheDocument()

      // Confirm actual delete
      const confirmDeleteButton = screen.getByTestId(
        'manage-index-delete-confirmation-btn',
      )
      expect(confirmDeleteButton).toBeInTheDocument()
      fireEvent.click(confirmDeleteButton)

      // Wait for the error notification to appear
      const errorNotification = await screen.findByText(
        'Failed to delete index',
      )
      expect(errorNotification).toBeInTheDocument()

      // Verify that telemetry event was not sent on error
      expect(telemetryMock).not.toHaveBeenCalled()
    })
  })
})
