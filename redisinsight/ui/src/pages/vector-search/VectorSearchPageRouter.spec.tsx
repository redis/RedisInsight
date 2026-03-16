import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { cleanup, render, screen } from 'uiSrc/utils/test-utils'
import { IRoute, Pages } from 'uiSrc/constants'
import { VectorSearchPageRouter } from './VectorSearchPageRouter'
import { useRedisInstanceCompatibility } from './hooks/useRedisInstanceCompatibility'

jest.mock('./hooks/useRedisInstanceCompatibility', () => ({
  useRedisInstanceCompatibility: jest.fn(),
}))

jest.mock('./components/rqe-not-available', () => {
  const react = require('react')
  return {
    RqeNotAvailable: () =>
      react.createElement('div', { 'data-testid': 'rqe-not-available' }),
  }
})

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
      hasSupportedVersion: undefined,
    })

    renderComponent()

    expect(screen.getByTestId('vector-search-loader')).toBeInTheDocument()
  })

  it('should render loader when compatibility is uninitialized', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: undefined,
      hasRedisearch: undefined,
      hasSupportedVersion: undefined,
    })

    renderComponent()

    expect(screen.getByTestId('vector-search-loader')).toBeInTheDocument()
  })

  it('should render RQE not available when RediSearch module is missing', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: false,
      hasSupportedVersion: true,
    })

    renderComponent()

    expect(
      screen.getByTestId('vector-search-page--rqe-not-available'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('rqe-not-available')).toBeInTheDocument()
  })
})
