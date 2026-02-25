import React from 'react'
import { getLetterByIndex } from 'uiSrc/utils'
import { rgb } from 'uiSrc/utils/colors'
import { render, screen } from 'uiSrc/utils/test-utils'

import ClusterNodesTable from './ClusterNodesTable'
import { ModifiedClusterNodes } from '../../ClusterDetailsPage'
import { ClusterNodeDetailsFactory } from 'uiSrc/mocks/factories/cluster/ClusterNodeDetails.factory'

const mockNodes = [
  ClusterNodeDetailsFactory.build({
    totalKeys: 1,
    opsPerSecond: 1,
  }),
  ClusterNodeDetailsFactory.build({
    totalKeys: 4,
    opsPerSecond: 1,
  }),
  ClusterNodeDetailsFactory.build({
    totalKeys: 10,
    opsPerSecond: 0,
  }),
].map((d, index) => ({
  ...d,
  letter: getLetterByIndex(index),
  index,
  color: [0, 0, 0],
})) as ModifiedClusterNodes[]

describe('ClusterNodesTable', () => {
  it('should render', () => {
    expect(
      render(
        <ClusterNodesTable nodes={mockNodes} loading={false} dataLoaded />,
      ),
    ).toBeTruthy()
  })

  it('should render loading content on initial load', () => {
    render(<ClusterNodesTable nodes={[]} loading dataLoaded={false} />)
    expect(
      screen.getByTestId('primary-nodes-table-loading'),
    ).toBeInTheDocument()
  })

  it('should render empty state when not loading and no nodes', () => {
    render(<ClusterNodesTable nodes={[]} loading={false} dataLoaded />)
    expect(screen.getByTestId('primary-nodes-table-empty')).toBeInTheDocument()
    expect(
      screen.queryByTestId('primary-nodes-table-loading'),
    ).not.toBeInTheDocument()
  })

  it('should not show loading skeleton during refresh poll when data already loaded', () => {
    render(<ClusterNodesTable nodes={[]} loading dataLoaded />)
    expect(screen.getByTestId('primary-nodes-table-empty')).toBeInTheDocument()
    expect(
      screen.queryByTestId('primary-nodes-table-loading'),
    ).not.toBeInTheDocument()
  })

  it('should render table', () => {
    const { container } = render(
      <ClusterNodesTable nodes={mockNodes} loading={false} dataLoaded />,
    )
    expect(container).toBeInTheDocument()
    expect(
      screen.queryByTestId('primary-nodes-table-loading'),
    ).not.toBeInTheDocument()
  })

  it('should render table with 3 items', () => {
    render(<ClusterNodesTable nodes={mockNodes} loading={false} dataLoaded />)
    expect(screen.getAllByTestId('node-letter')).toHaveLength(3)
  })

  it('should highlight max value for total keys', () => {
    render(<ClusterNodesTable nodes={mockNodes} loading={false} dataLoaded />)
    expect(screen.getByTestId('totalKeys-value-max')).toHaveTextContent(
      mockNodes[2].totalKeys.toString(),
    )
  })

  it('should not highlight max value for opsPerSecond with equals values', () => {
    render(<ClusterNodesTable nodes={mockNodes} loading={false} dataLoaded />)
    expect(
      screen.queryByTestId('opsPerSecond-value-max'),
    ).not.toBeInTheDocument()
  })

  it('should render background color for each node', () => {
    render(<ClusterNodesTable nodes={mockNodes} loading={false} dataLoaded />)
    mockNodes.forEach(({ letter, color }) => {
      expect(screen.getByTestId(`node-color-${letter}`)).toHaveStyle({
        'background-color': rgb(color),
      })
    })
  })
})
