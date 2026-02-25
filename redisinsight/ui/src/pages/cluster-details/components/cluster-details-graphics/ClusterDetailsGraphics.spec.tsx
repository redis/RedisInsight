import React from 'react'
import { ModifiedClusterNodes } from 'uiSrc/pages/clusterDetails/ClusterDetailsPage'
import { render, screen } from 'uiSrc/utils/test-utils'

import ClusterDetailsGraphics from './ClusterDetailsGraphics'

const mockNodes = [
  {
    id: '1',
    host: '0.0.0.1',
    port: 6379,
    role: 'primary',
    slots: ['10923-16383'],
    health: 'online',
    totalKeys: 1,
    usedMemory: 2867968,
    opsPerSecond: 1,
    connectionsReceived: 13,
    connectedClients: 6,
    commandsProcessed: 5678,
    networkInKbps: 0.02,
    networkOutKbps: 0,
    cacheHitRatio: 1,
    replicationOffset: 6924,
    uptimeSec: 5614,
    version: '6.2.6',
    mode: 'cluster',
    replicas: [],
  },
  {
    id: '2',
    host: '0.0.0.2',
    port: 6379,
    role: 'primary',
    slots: ['0-5460'],
    health: 'online',
    totalKeys: 4,
    usedMemory: 2825880,
    opsPerSecond: 1,
    connectionsReceived: 15,
    connectedClients: 4,
    commandsProcessed: 5667,
    networkInKbps: 0.04,
    networkOutKbps: 0,
    cacheHitRatio: 1,
    replicationOffset: 6910,
    uptimeSec: 5609,
    version: '6.2.6',
    mode: 'cluster',
    replicas: [],
  },
  {
    id: '3',
    host: '0.0.0.3',
    port: 6379,
    role: 'primary',
    slots: ['5461-10922'],
    health: 'online',
    totalKeys: 10,
    usedMemory: 2886960,
    opsPerSecond: 0,
    connectionsReceived: 18,
    connectedClients: 7,
    commandsProcessed: 5697,
    networkInKbps: 0.02,
    networkOutKbps: 0,
    cacheHitRatio: 0,
    replicationOffset: 6991,
    uptimeSec: 5609,
    version: '6.2.6',
    mode: 'cluster',
    replicas: [],
  },
].map((d, index) => ({
  ...d,
  letter: 'A',
  index,
  color: [0, 0, 0],
})) as ModifiedClusterNodes[]

describe('ClusterDetailsGraphics', () => {
  it('should render', () => {
    expect(
      render(<ClusterDetailsGraphics nodes={mockNodes} dataLoaded />),
    ).toBeTruthy()
  })

  it('should render loading when data not yet loaded', () => {
    render(<ClusterDetailsGraphics nodes={[]} dataLoaded={false} />)
    expect(
      screen.getByTestId('cluster-details-graphics-loading'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('cluster-details-charts'),
    ).not.toBeInTheDocument()
  })

  it('should render nothing when data loaded but no nodes', () => {
    render(<ClusterDetailsGraphics nodes={[]} dataLoaded />)
    expect(
      screen.queryByTestId('cluster-details-graphics-loading'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('cluster-details-charts'),
    ).not.toBeInTheDocument()
  })

  it('should render donuts', () => {
    render(<ClusterDetailsGraphics nodes={mockNodes} dataLoaded />)
    expect(screen.getByTestId('donut-memory')).toBeInTheDocument()
    expect(screen.queryByTestId('donut-keys')).toBeInTheDocument()
  })
})
