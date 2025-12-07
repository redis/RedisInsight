import React from 'react'
import { getGroupTypeDisplay } from 'uiSrc/utils'
import { render, screen } from 'uiSrc/utils/test-utils'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import SummaryPerData from './SummaryPerData'

const mockData = {
  totalMemory: {
    total: 75,
    types: [
      {
        type: 'hash',
        total: 18,
      },
      {
        type: 'TSDB-TYPE',
        total: 11,
      },
      {
        type: 'string',
        total: 10,
      },
      {
        type: 'list',
        total: 9,
      },
      {
        type: 'stream',
        total: 8,
      },
      {
        type: 'zset',
        total: 8,
      },
      {
        type: 'set',
        total: 7,
      },
      {
        type: 'graphdata',
        total: 2,
      },
      {
        type: 'ReJSON-RL',
        total: 1,
      },
      {
        type: 'MBbloom--',
        total: 1,
      },
    ],
  },
  totalKeys: {
    total: 1168424,
    types: [
      {
        type: 'hash',
        total: 572813,
      },
      {
        type: 'zset',
        total: 233571,
      },
      {
        type: 'set',
        total: 138184,
      },
      {
        type: 'list',
        total: 95886,
      },
      {
        type: 'stream',
        total: 79532,
      },
      {
        type: 'TSDB-TYPE',
        total: 47143,
      },
      {
        type: 'string',
        total: 891,
      },
      {
        type: 'MBbloom--',
        total: 272,
      },
      {
        type: 'graphdata',
        total: 72,
      },
      {
        type: 'ReJSON-RL',
        total: 60,
      },
    ],
  },
} as DatabaseAnalysis

describe('SummaryPerData', () => {
  it('should render', () => {
    expect(
      render(<SummaryPerData data={mockData} loading={false} />),
    ).toBeTruthy()
  })

  it('should render nothing without data', () => {
    render(<SummaryPerData data={null} loading={false} />)

    expect(
      screen.queryByTestId('summary-per-data-loading'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('summary-per-data')).not.toBeInTheDocument()
  })

  it('should render loading', () => {
    render(<SummaryPerData data={mockData} loading />)

    expect(screen.getByTestId('summary-per-data-loading')).toBeInTheDocument()
  })

  it('should render charts', () => {
    render(<SummaryPerData data={mockData} loading={false} />)
    expect(screen.getByTestId('donut-memory')).toBeInTheDocument()
    expect(screen.queryByTestId('donut-keys')).toBeInTheDocument()
  })

  it('should render chart arcs', () => {
    render(<SummaryPerData data={mockData} loading={false} />)

    mockData.totalKeys.types.forEach((t) => {
      expect(
        screen.getByTestId(`arc-${getGroupTypeDisplay(t.type)}-${t.total}`),
      ).toBeInTheDocument()
    })

    mockData.totalMemory.types.forEach((t) => {
      expect(
        screen.getByTestId(`arc-${getGroupTypeDisplay(t.type)}-${t.total}`),
      ).toBeInTheDocument()
    })
  })

  it('should render chart labels', () => {
    render(<SummaryPerData data={mockData} loading={false} />)

    mockData.totalKeys.types.forEach((t) => {
      expect(
        screen.getByTestId(`label-${getGroupTypeDisplay(t.type)}-${t.total}`),
      ).toBeInTheDocument()
    })

    mockData.totalMemory.types.forEach((t) => {
      expect(
        screen.getByTestId(`label-${getGroupTypeDisplay(t.type)}-${t.total}`),
      ).toBeInTheDocument()
    })
  })
})
