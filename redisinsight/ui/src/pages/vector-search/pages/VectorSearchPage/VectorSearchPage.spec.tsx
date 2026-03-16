import React from 'react'
import {
  cleanup,
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { sendPageViewTelemetry } from 'uiSrc/telemetry'
import { TelemetryPageView } from 'uiSrc/telemetry/pageViews'
import { RootState } from 'uiSrc/slices/store'
import {
  INSTANCE_ID_MOCK,
  INSTANCES_MOCK,
} from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { VectorSearchPage } from './VectorSearchPage'
import { useRedisearchListData } from '../../hooks/useRedisearchListData'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
}))

jest.mock('../../hooks/useRedisearchListData', () => ({
  useRedisearchListData: jest.fn(),
}))

jest.mock('../../context/vector-search', () => ({
  useVectorSearch: jest.fn(() => ({
    openPickSampleDataModal: jest.fn(),
  })),
}))

const getTestState = (): RootState => ({
  ...initialStateDefault,
  connections: {
    ...initialStateDefault.connections,
    instances: {
      ...initialStateDefault.connections.instances,
      connectedInstance: {
        ...initialStateDefault.connections.instances.connectedInstance,
        ...INSTANCES_MOCK[0],
      },
    },
  },
})

const renderComponent = () => {
  const store = mockStore(getTestState())
  return render(<VectorSearchPage />, { store })
}

describe('VectorSearchPage', () => {
  const mockUseRedisearchListData = useRedisearchListData as jest.Mock

  beforeEach(() => {
    cleanup()

    mockUseRedisearchListData.mockReturnValue({
      loading: false,
      data: [],
      stringData: [],
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render vector search page', () => {
    const { container } = renderComponent()

    expect(container).toBeTruthy()
  })

  it('should render loader while loading indexes', () => {
    mockUseRedisearchListData.mockReturnValue({
      loading: true,
      data: [],
      stringData: [],
    })

    renderComponent()

    const loader = screen.getByTestId('vector-search-loader')
    expect(loader).toBeInTheDocument()
  })

  it('should render loader when indexes loading is undefined (not yet fetched)', () => {
    mockUseRedisearchListData.mockReturnValue({
      loading: undefined,
      data: [],
      stringData: [],
    })

    renderComponent()

    const loader = screen.getByTestId('vector-search-loader')
    expect(loader).toBeInTheDocument()

    const welcomeScreen = screen.queryByTestId('welcome-screen')
    expect(welcomeScreen).not.toBeInTheDocument()
  })

  it('should render welcome screen when no indexes exist', () => {
    mockUseRedisearchListData.mockReturnValue({
      loading: false,
      data: [],
      stringData: [],
    })

    renderComponent()

    const welcomeScreen = screen.getByTestId('welcome-screen')
    expect(welcomeScreen).toBeInTheDocument()
  })

  it('should render index list screen when indexes exist', () => {
    mockUseRedisearchListData.mockReturnValue({
      loading: false,
      data: [Buffer.from('index1'), Buffer.from('index2')],
      stringData: ['index1', 'index2'],
    })

    renderComponent()

    const listPage = screen.getByTestId('vector-search--list--page')
    expect(listPage).toBeInTheDocument()
  })

  it('should send page view telemetry with enhanced data when ready', () => {
    mockUseRedisearchListData.mockReturnValue({
      loading: false,
      data: [Buffer.from('index1')],
      stringData: ['index1'],
    })

    renderComponent()

    expect(sendPageViewTelemetry).toHaveBeenCalledTimes(1)
    expect(sendPageViewTelemetry).toHaveBeenCalledWith({
      name: TelemetryPageView.VECTOR_SEARCH_PAGE,
      eventData: expect.objectContaining({
        databaseId: INSTANCE_ID_MOCK,
        number_of_indexes: 1,
        welcome_page_enabled: false,
      }),
    })
  })

  it('should send welcome_page_enabled=true when no indexes', () => {
    renderComponent()

    expect(sendPageViewTelemetry).toHaveBeenCalledTimes(1)
    expect(sendPageViewTelemetry).toHaveBeenCalledWith({
      name: TelemetryPageView.VECTOR_SEARCH_PAGE,
      eventData: expect.objectContaining({
        databaseId: INSTANCE_ID_MOCK,
        number_of_indexes: 0,
        welcome_page_enabled: true,
      }),
    })
  })

  it('should not send page view telemetry while still loading', () => {
    mockUseRedisearchListData.mockReturnValue({
      loading: true,
      data: [],
      stringData: [],
    })

    renderComponent()

    expect(sendPageViewTelemetry).not.toHaveBeenCalled()
  })

  it('should set page title correctly', () => {
    renderComponent()

    expect(document.title).toBe(
      `${INSTANCES_MOCK[0].name} [db${INSTANCES_MOCK[0].db}] - Vector Search`,
    )
  })
})
