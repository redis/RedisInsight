import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { cleanup, render, screen } from 'uiSrc/utils/test-utils'
import { IRoute, Pages } from 'uiSrc/constants'
import { VectorSearchPageRouter } from './VectorSearchPageRouter'
import { useRedisInstanceCompatibility } from './hooks/useRedisInstanceCompatibility'

jest.mock('./hooks/useRedisInstanceCompatibility', () => ({
  useRedisInstanceCompatibility: jest.fn(),
}))

jest.mock('./hooks/useLastViewedPage', () => ({
  useLastViewedPage: jest.fn(),
}))

jest.mock('./context/vector-search', () => ({
  VectorSearchProvider: ({ children }: { children: unknown }) => children,
}))

const DummyPage = () => <div data-testid="dummy-page">Dummy</div>

const routes: IRoute[] = [
  {
    path: Pages.vectorSearch(':instanceId'),
    component: DummyPage,
  },
]

const renderComponent = () =>
  render(
    <BrowserRouter>
      <VectorSearchPageRouter routes={routes} />
    </BrowserRouter>,
  )

describe('VectorSearchPageRouter', () => {
  const mockUseRedisInstanceCompatibility =
    useRedisInstanceCompatibility as jest.Mock

  beforeEach(() => {
    cleanup()
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: true,
      hasMinimumRedisearchVersion: true,
      hasSupportedVersion: true,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render child routes when RediSearch is available', () => {
    renderComponent()

    expect(
      screen.queryByTestId('vector-search-page--rqe-not-available'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('vector-search-loader')).not.toBeInTheDocument()
  })

  it('should render loader while compatibility is loading', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: true,
      hasRedisearch: undefined,
      hasMinimumRedisearchVersion: undefined,
      hasSupportedVersion: undefined,
    })

    renderComponent()

    expect(screen.getByTestId('vector-search-loader')).toBeInTheDocument()
  })

  it('should render loader when compatibility is uninitialized', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: undefined,
      hasRedisearch: undefined,
      hasMinimumRedisearchVersion: undefined,
      hasSupportedVersion: undefined,
    })

    renderComponent()

    expect(screen.getByTestId('vector-search-loader')).toBeInTheDocument()
  })

  it('should render version not supported when RediSearch version < 2.0', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: true,
      hasMinimumRedisearchVersion: false,
      hasSupportedVersion: false,
    })

    renderComponent()

    expect(
      screen.getByTestId('vector-search-page--version-not-supported'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('version-not-supported')).toBeInTheDocument()
  })

  it('should render version not supported when RediSearch is present but version < 2.0', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: true,
      hasMinimumRedisearchVersion: false,
      hasSupportedVersion: false,
    })

    renderComponent()

    expect(
      screen.getByTestId('vector-search-page--version-not-supported'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('vector-search-page--rqe-not-available'),
    ).not.toBeInTheDocument()
  })

  it('should render RQE not available when RediSearch module is missing but version is supported', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: false,
      hasMinimumRedisearchVersion: true,
      hasSupportedVersion: true,
    })

    renderComponent()

    expect(
      screen.getByTestId('vector-search-page--rqe-not-available'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('rqe-not-available')).toBeInTheDocument()
  })
})
