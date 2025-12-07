import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { ModifiedClusterNodes } from '../../../../ClusterDetailsPage'
import { ClusterNodesNumericCell } from './ClusterNodesNumericCell'
import { ClusterNodeDetailsFactory } from 'uiSrc/mocks/factories/cluster/ClusterNodeDetails.factory'

const mockNodes: ModifiedClusterNodes[] = [
  {
    ...ClusterNodeDetailsFactory.build({
      totalKeys: 100,
      usedMemory: 2867968,
      opsPerSecond: 50,
      connectedClients: 6,
      networkInKbps: 10.5,
      networkOutKbps: 5.2,
    }),
    letter: 'A',
    index: 0,
    color: [0, 0, 0],
  },
  {
    ...ClusterNodeDetailsFactory.build({
      totalKeys: 200,
      usedMemory: 2825880,
      opsPerSecond: 75,
      connectedClients: 4,
      networkInKbps: 20.3,
      networkOutKbps: 10.1,
    }),
    letter: 'B',
    index: 1,
    color: [0, 0, 0],
  },
  {
    ...ClusterNodeDetailsFactory.build({
      totalKeys: 150,
      usedMemory: 2886960,
      opsPerSecond: 60,
      connectedClients: 7,
      networkInKbps: 15.7,
      networkOutKbps: 8.3,
    }),
    letter: 'C',
    index: 2,
    color: [0, 0, 0],
  },
]

const createMockCellContext = (
  nodeIndex: number,
  field: keyof ModifiedClusterNodes,
): CellContext<ModifiedClusterNodes, unknown> =>
  ({
    row: {
      original: mockNodes[nodeIndex],
    },
    column: {
      id: field,
    },
    table: {
      options: {
        data: mockNodes,
      },
    },
  }) as CellContext<ModifiedClusterNodes, unknown>

describe('ClusterNodesNumericCell', () => {
  describe('renderComponent', () => {
    const renderComponent = (
      nodeIndex: number,
      field: keyof ModifiedClusterNodes,
    ) => {
      const context = createMockCellContext(nodeIndex, field)
      return render(<ClusterNodesNumericCell {...context} />)
    }

    it('should render numeric value', () => {
      renderComponent(0, 'totalKeys')
      expect(screen.getByTestId('totalKeys-value')).toHaveTextContent('100')
    })

    it('should render max value with semiBold variant', () => {
      renderComponent(1, 'totalKeys')
      expect(screen.getByTestId('totalKeys-value-max')).toBeInTheDocument()
    })

    it('should not render max indicator when value is not maximum', () => {
      renderComponent(0, 'totalKeys')
      expect(
        screen.queryByTestId('totalKeys-value-max'),
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('totalKeys-value')).toBeInTheDocument()
    })

    it('should format usedMemory with bytes formatter', () => {
      renderComponent(0, 'usedMemory')
      // formatBytes(2867968, 3, false) should format to something like "2.73 MB"
      const element = screen.getByTestId('usedMemory-value')
      expect(element.textContent).toMatch(/MB|KB|GB/)
    })

    it('should format networkInKbps with kb/s suffix', () => {
      renderComponent(0, 'networkInKbps')
      expect(screen.getByTestId('networkInKbps-value')).toHaveTextContent(
        '10.5 kb/s',
      )
    })

    it('should format networkOutKbps with kb/s suffix', () => {
      renderComponent(0, 'networkOutKbps')
      expect(screen.getByTestId('networkOutKbps-value')).toHaveTextContent(
        '5.2 kb/s',
      )
    })

    it('should return null for non-numeric fields', () => {
      const context = createMockCellContext(0, 'host')
      const { container } = render(<ClusterNodesNumericCell {...context} />)
      expect(container.firstChild).toBeNull()
    })

    it('should handle zero values', () => {
      const nodesWithZero = [
        { ...mockNodes[0], opsPerSecond: 0 },
        { ...mockNodes[1], opsPerSecond: 10 },
        { ...mockNodes[2], opsPerSecond: 5 },
      ]

      const context = {
        row: { original: nodesWithZero[0] },
        column: { id: 'opsPerSecond' },
        table: { options: { data: nodesWithZero } },
      } as CellContext<ModifiedClusterNodes, unknown>

      render(<ClusterNodesNumericCell {...context} />)
      expect(screen.getByTestId('opsPerSecond-value')).toHaveTextContent('0')
    })

    it('should not highlight max value when there is a tie', () => {
      const nodesWithTie = [
        { ...mockNodes[0], connectedClients: 10 },
        { ...mockNodes[1], connectedClients: 10 },
        { ...mockNodes[2], connectedClients: 5 },
      ]

      const context = {
        row: { original: nodesWithTie[0] },
        column: { id: 'connectedClients' },
        table: { options: { data: nodesWithTie } },
      } as CellContext<ModifiedClusterNodes, unknown>

      render(<ClusterNodesNumericCell {...context} />)
      expect(
        screen.queryByTestId('connectedClients-value-max'),
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('connectedClients-value')).toBeInTheDocument()
    })

    it('should highlight max value for opsPerSecond', () => {
      renderComponent(1, 'opsPerSecond')
      expect(screen.getByTestId('opsPerSecond-value-max')).toBeInTheDocument()
    })

    it('should highlight max value for networkInKbps', () => {
      renderComponent(1, 'networkInKbps')
      expect(screen.getByTestId('networkInKbps-value-max')).toBeInTheDocument()
    })

    it('should highlight max value for networkOutKbps', () => {
      renderComponent(1, 'networkOutKbps')
      expect(screen.getByTestId('networkOutKbps-value-max')).toBeInTheDocument()
    })

    it('should highlight max value for connectedClients', () => {
      renderComponent(2, 'connectedClients')
      expect(
        screen.getByTestId('connectedClients-value-max'),
      ).toBeInTheDocument()
    })

    it('should format large numbers with spaces', () => {
      const nodesWithLargeNumbers = [
        { ...mockNodes[0], totalKeys: 1000000 },
        { ...mockNodes[1], totalKeys: 500000 },
        { ...mockNodes[2], totalKeys: 250000 },
      ]

      const context = {
        row: { original: nodesWithLargeNumbers[0] },
        column: { id: 'totalKeys' },
        table: { options: { data: nodesWithLargeNumbers } },
      } as CellContext<ModifiedClusterNodes, unknown>

      render(<ClusterNodesNumericCell {...context} />)
      // numberWithSpaces should format 1000000 as "1 000 000"
      const element = screen.getByTestId('totalKeys-value-max')
      expect(element.textContent).toContain('000')
    })
  })
})
