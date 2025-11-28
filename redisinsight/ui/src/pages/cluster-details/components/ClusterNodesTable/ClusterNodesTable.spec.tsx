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
    expect(render(<ClusterNodesTable nodes={mockNodes} />)).toBeTruthy()
  })

  it('should render loading content', () => {
    render(<ClusterNodesTable nodes={[]} />)
    expect(
      screen.getByTestId('primary-nodes-table-loading'),
    ).toBeInTheDocument()
  })

  it('should render table', () => {
    render(<ClusterNodesTable nodes={mockNodes} />)
    expect(screen.getByTestId('primary-nodes-table')).toBeInTheDocument()
    expect(
      screen.queryByTestId('primary-nodes-table-loading'),
    ).not.toBeInTheDocument()
  })

  it('should render table with 3 items', () => {
    render(<ClusterNodesTable nodes={mockNodes} />)
    expect(screen.getAllByTestId('node-letter')).toHaveLength(3)
  })

  it('should highlight max value for total keys', () => {
    render(<ClusterNodesTable nodes={mockNodes} />)
    expect(screen.getByTestId('totalKeys-value-max')).toHaveTextContent(
      mockNodes[2].totalKeys.toString(),
    )
  })

  it('should not highlight max value for opsPerSecond with equals values', () => {
    render(<ClusterNodesTable nodes={mockNodes} />)
    expect(
      screen.queryByTestId('opsPerSecond-value-max'),
    ).not.toBeInTheDocument()
  })

  it('should render background color for each node', () => {
    render(<ClusterNodesTable nodes={mockNodes} />)
    mockNodes.forEach(({ letter, color }) => {
      expect(screen.getByTestId(`node-color-${letter}`)).toHaveStyle({
        'background-color': rgb(color),
      })
    })
  })
})
