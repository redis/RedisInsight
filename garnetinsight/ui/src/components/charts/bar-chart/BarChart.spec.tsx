import { isEmpty, last, min as minBy, reject } from 'lodash'
import React from 'react'
import { render, screen, fireEvent, waitFor } from 'uiSrc/utils/test-utils'

import BarChart, { BarChartData, BarChartDataType } from './BarChart'

const mockData: BarChartData[] = [
  { x: 1, y: 0, xlabel: '', ylabel: '' },
  { x: 5, y: 0.1, xlabel: '', ylabel: '' },
  { x: 10, y: 20, xlabel: '', ylabel: '' },
  { x: 2, y: 30, xlabel: '', ylabel: '' },
  { x: 30, y: 40, xlabel: '', ylabel: '' },
  { x: 15, y: 50000, xlabel: '', ylabel: '' },
]

describe('BarChart', () => {
  it('should render with empty data', () => {
    expect(render(<BarChart data={[]} />)).toBeTruthy()
  })

  it('should render with data', () => {
    expect(render(<BarChart data={mockData} />)).toBeTruthy()
  })

  it('should not render area with empty data', () => {
    const { container } = render(<BarChart data={[]} name="test" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render svg', () => {
    render(<BarChart data={mockData} name="test" />)
    expect(screen.getByTestId('bar-test')).toBeInTheDocument()
  })

  it('should render bars', () => {
    render(<BarChart data={mockData} />)
    mockData.forEach(({ x, y }) => {
      expect(screen.getByTestId(`bar-${x}-${y}`)).toBeInTheDocument()
    })
  })

  it('should render smallest bar with min height', () => {
    const minBarHeight = 5
    const smallestBar = minBy(
      reject([...mockData], ({ y }) => !y),
      ({ y }, i) => y,
    ) ?? { x: 0, y: 0 }

    render(<BarChart data={mockData} minBarHeight={minBarHeight} />)
    expect(
      screen.getByTestId(`bar-${smallestBar.x}-${smallestBar.y}`),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId(`bar-${smallestBar.x}-${smallestBar.y}`),
    ).toHaveAttribute('height', `${minBarHeight}`)
  })

  it('should render tooltip and content inside', async () => {
    render(<BarChart data={mockData} name="test" />)

    await waitFor(
      () => {
        fireEvent.mouseMove(screen.getByTestId('bar-15-50000'))
      },
      { timeout: 210 },
    ) // Account for long delay on tooltips

    expect(screen.getByTestId('bar-tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('bar-tooltip')).toHaveTextContent('50000')
  })

  it('when dataType="Bytes" max value should be rounded by metric', async () => {
    const lastDataValue = last(mockData)
    const { queryByTestId } = render(
      <BarChart
        data={mockData}
        name="test"
        dataType={BarChartDataType.Bytes}
      />,
    )

    expect(queryByTestId(`ytick-${lastDataValue?.y}-4`)).not.toBeInTheDocument()
    expect(queryByTestId('ytick-51200-8')).toBeInTheDocument()
    expect(queryByTestId('ytick-51200-8')).toHaveTextContent('51200')
  })

  it('when dataType!="Bytes" max value should be rounded by default', async () => {
    const lastDataValue = last(mockData)
    const { queryByTestId } = render(<BarChart data={mockData} name="test" />)

    expect(queryByTestId('ytick-51200-8')).not.toBeInTheDocument()
    expect(queryByTestId(`ytick-${lastDataValue?.y}-8`)).toBeInTheDocument()
    expect(queryByTestId(`ytick-${lastDataValue?.y}-8`)).toHaveTextContent(
      `${lastDataValue?.y}`,
    )
  })
})
