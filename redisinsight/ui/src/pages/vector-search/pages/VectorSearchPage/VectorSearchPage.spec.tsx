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
import { useRedisInstanceCompatibility } from '../../hooks/useRedisInstanceCompatibility'
import { useRedisearchListData } from '../../hooks/useRedisearchListData'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
}))

jest.mock('../../hooks/useRedisInstanceCompatibility', () => ({
  useRedisInstanceCompatibility: jest.fn(),
}))

jest.mock('../../hooks/useRedisearchListData', () => ({
  useRedisearchListData: jest.fn(),
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
  const mockUseRedisInstanceCompatibility =
    useRedisInstanceCompatibility as jest.Mock
  const mockUseRedisearchListData = useRedisearchListData as jest.Mock

  beforeEach(() => {
    cleanup()

    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: true,
      hasSupportedVersion: true,
    })

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

  it('should render loader while checking compatibility', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: true,
      hasRedisearch: undefined,
      hasSupportedVersion: undefined,
    })

    renderComponent()

    const loader = screen.getByTestId('vector-search-loader')
    expect(loader).toBeInTheDocument()
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

  it('should render loader when compatibility is uninitialized (undefined) even if indexes are not loading', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: undefined,
      hasRedisearch: undefined,
      hasSupportedVersion: undefined,
    })
    mockUseRedisearchListData.mockReturnValue({
      loading: false,
      data: [],
      stringData: [],
    })

    renderComponent()

    const loader = screen.getByTestId('vector-search-loader')
    expect(loader).toBeInTheDocument()

    const welcomeScreen = screen.queryByTestId('vector-search--welcome-screen')
    expect(welcomeScreen).not.toBeInTheDocument()
  })

  it('should render RQE not available screen when RediSearch is not available', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: false,
      hasSupportedVersion: true,
    })

    renderComponent()

    const rqeScreen = screen.getByTestId(
      'vector-search-page--rqe-not-available',
    )
    expect(rqeScreen).toBeInTheDocument()
  })

  it('should render welcome screen when no indexes exist', () => {
    mockUseRedisearchListData.mockReturnValue({
      loading: false,
      data: [],
      stringData: [],
    })

    renderComponent()

    const welcomeScreen = screen.getByTestId('vector-search--welcome-screen')
    expect(welcomeScreen).toBeInTheDocument()
  })

  it('should render index list screen when indexes exist', () => {
    mockUseRedisearchListData.mockReturnValue({
      loading: false,
      data: [Buffer.from('index1'), Buffer.from('index2')],
      stringData: ['index1', 'index2'],
    })

    renderComponent()

    const indexListScreen = screen.getByTestId(
      'vector-search--index-list-screen',
    )
    expect(indexListScreen).toBeInTheDocument()
  })

  it('should send page view telemetry on mount', () => {
    renderComponent()

    expect(sendPageViewTelemetry).toHaveBeenCalledTimes(1)
    expect(sendPageViewTelemetry).toHaveBeenCalledWith({
      name: TelemetryPageView.VECTOR_SEARCH_PAGE,
      eventData: { databaseId: INSTANCE_ID_MOCK },
    })
  })

  it('should set page title correctly', () => {
    renderComponent()

    expect(document.title).toBe(
      `${INSTANCES_MOCK[0].name} [db${INSTANCES_MOCK[0].db}] - Vector Search`,
    )
  })
})
