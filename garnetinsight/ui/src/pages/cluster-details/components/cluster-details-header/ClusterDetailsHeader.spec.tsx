import React from 'react'
import { clusterDetailsSelector } from 'uiSrc/slices/analytics/clusterDetails'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { render, screen } from 'uiSrc/utils/test-utils'

import ClusterDetailsHeader from './ClusterDetailsHeader'

jest.mock('uiSrc/slices/analytics/clusterDetails', () => ({
  ...jest.requireActual('uiSrc/slices/analytics/clusterDetails'),
  clusterDetailsSelector: jest.fn().mockReturnValue({
    data: null,
    loading: false,
    error: '',
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    username: '',
  }),
}))

describe('ClusterDetailsHeader', () => {
  it('should render', () => {
    expect(render(<ClusterDetailsHeader />)).toBeTruthy()
  })

  it('should render "EuiLoadingContent" until loading and no data', () => {
    ;(clusterDetailsSelector as jest.Mock).mockImplementation(() => ({
      data: null,
      loading: true,
      error: '',
    }))

    render(<ClusterDetailsHeader />)

    expect(screen.getByTestId('cluster-details-loading')).toBeInTheDocument()
  })
  it('should render "cluster-details-content" after loading and with data', () => {
    ;(clusterDetailsSelector as jest.Mock).mockImplementation(() => ({
      data: { version: '111' },
      loading: false,
      error: '',
    }))

    const { queryByTestId } = render(<ClusterDetailsHeader />)

    expect(queryByTestId('cluster-details-loading')).not.toBeInTheDocument()
    expect(queryByTestId('cluster-details-username')).not.toBeInTheDocument()
    expect(queryByTestId('cluster-details-content')).toBeInTheDocument()
  })

  it('huge username should be truncated', () => {
    ;(clusterDetailsSelector as jest.Mock).mockImplementation(() => ({
      data: { version: '111' },
      loading: false,
      error: '',
    }))
    ;(connectedInstanceSelector as jest.Mock).mockImplementation(() => ({
      username: Array.from({ length: 50 }).fill('test').join(''),
    }))

    const { queryByTestId } = render(<ClusterDetailsHeader />)

    expect(queryByTestId('cluster-details-username')).toBeInTheDocument()
  })

  it.skip('uptime should be with truncated to first unit', () => {
    ;(clusterDetailsSelector as jest.Mock).mockImplementation(() => ({
      data: { uptimeSec: 11111 },
      loading: false,
      error: '',
    }))

    const { queryByTestId } = render(<ClusterDetailsHeader />)

    expect(queryByTestId('cluster-details-uptime')).toHaveTextContent('3 h')
  })
})
