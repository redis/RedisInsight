import * as d3 from 'd3'
import React, { useEffect, useRef } from 'react'
import cx from 'classnames'
import { curryRight, flow, toNumber } from 'lodash'

import { formatBytes, toBytes } from 'uiSrc/utils'
import { Wrapper, StyledSVG, TooltipGlobalStyles } from './BarChart.styles'

export interface BarChartData {
  y: number
  x: number
  xlabel: string
  ylabel: string
}

interface IDatum extends BarChartData {
  index: number
}

export enum BarChartDataType {
  Bytes = 'bytes',
}

export interface IProps {
  name?: string
  data?: BarChartData[]
  dataType?: BarChartDataType
  barWidth?: number
  minBarHeight?: number
  width?: number
  height?: number
  yCountTicks?: number
  divideLastColumn?: boolean
  multiplierGrid?: number
  classNames?: {
    bar?: string
    dashedLine?: string
    tooltip?: string
    scatterPoints?: string
  }
  tooltipValidation?: (val: any, index: number) => string
  leftAxiosValidation?: (val: any, index: number) => any
  bottomAxiosValidation?: (val: any, index: number) => any
}

export const DEFAULT_MULTIPLIER_GRID = 5
export const DEFAULT_Y_TICKS = 8
export const DEFAULT_BAR_WIDTH = 40
export const MIN_BAR_HEIGHT = 3
let cleanedData: IDatum[] = []

const BarChart = (props: IProps) => {
  const {
    data = [],
    name,
    width: propWidth = 0,
    height: propHeight = 0,
    barWidth = DEFAULT_BAR_WIDTH,
    yCountTicks = DEFAULT_Y_TICKS,
    minBarHeight = MIN_BAR_HEIGHT,
    dataType,
    classNames,
    divideLastColumn,
    multiplierGrid = DEFAULT_MULTIPLIER_GRID,
    tooltipValidation = (val) => val,
    leftAxiosValidation = (val) => val,
    bottomAxiosValidation = (val) => val,
  } = props

  const margin = { top: 10, right: 0, bottom: 32, left: 60 }
  const width = propWidth - margin.left - margin.right
  const height = propHeight - margin.top - margin.bottom

  const svgRef = useRef<SVGSVGElement>(null)

  const getRoundedYMaxValue = (number: number): number => {
    const numLen = number.toString().length
    const dividerValue = toNumber(`1${'0'.repeat(numLen - 1)}`)

    return Math.ceil(number / dividerValue) * dividerValue
  }

  useEffect(() => {
    if (data.length === 0) {
      return undefined
    }

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', cx('bar-chart-tooltip', classNames?.tooltip || ''))
      .style('opacity', 0)

    d3.select(svgRef.current).select('g').remove()

    // append the svg object to the body of the page
    const svg = d3
      .select(svgRef.current)
      .attr('data-testid', `bar-${name}`)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 30)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const tempData = [...data]

    tempData.push({ x: 0, y: 0, xlabel: '', ylabel: '' })
    cleanedData = tempData.map((datum, index) => ({
      index,
      xlabel: `${datum?.xlabel || ''}`,
      ylabel: `${datum?.ylabel || ''}`,
      y: datum.y || 0,
      x: datum.x || 0,
    }))

    // Add X axis
    const xAxis = d3
      .scaleLinear()
      .domain(d3.extent(cleanedData, (d) => d.index) as [number, number])
      .range([0, width])

    let maxY = d3.max(cleanedData, (d) => d.y) || yCountTicks

    if (dataType === BarChartDataType.Bytes) {
      const curriedTyBytes = curryRight(toBytes)
      const [maxYFormatted, type] = formatBytes(maxY, 1, true)

      maxY = flow(
        toNumber,
        Math.ceil,
        getRoundedYMaxValue,
        curriedTyBytes(`${type}`),
      )(maxYFormatted)
    }

    // Add Y axis
    const yAxis = d3
      .scaleLinear()
      .domain([0, maxY || 0])
      .range([height, 0])

    // divider for last column
    if (divideLastColumn) {
      svg
        .append('line')
        .attr('class', cx('bar-chart-dashed-line', classNames?.dashedLine))
        .attr('x1', xAxis(cleanedData.length - 2.3))
        .attr('x2', xAxis(cleanedData.length - 2.3))
        .attr('y1', 0)
        .attr('y2', height)
    }

    // squared background for Y axis
    svg.append('g').call(
      d3
        .axisLeft(yAxis)
        .tickSize(
          -width + (2 * width) / (cleanedData.length * multiplierGrid) + 6,
        )
        .tickValues([...d3.range(0, maxY, maxY / yCountTicks), maxY])
        .tickFormat((d, i) => leftAxiosValidation(d, i))
        .ticks(cleanedData.length * multiplierGrid)
        .tickPadding(10),
    )

    const yTicks = d3.selectAll('.tick')
    yTicks.attr('data-testid', (d, i) => `ytick-${d}-${i}`)

    // squared background for X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xAxis)
          .ticks(cleanedData.length * multiplierGrid)
          .tickFormat((d, i) => bottomAxiosValidation(d, i))
          .tickSize(-height)
          .tickPadding(22),
      )

    // TODO: hide last 2 columns of background grid
    const allTicks = d3.selectAll('.tick')
    allTicks.attr('opacity', (_a, i) =>
      i === allTicks.size() - 1 || i === allTicks.size() - 2 ? 0 : 1,
    )

    // moving X axios labels under the center of Bar
    svg.selectAll('text').attr('x', barWidth / 2)

    // roll back all changes for Y axios labels
    yTicks.attr('opacity', '1')
    yTicks.selectAll('text').attr('x', -10)

    // bars
    svg
      .selectAll('.bar')
      .data(cleanedData)
      .enter()
      .append('rect')
      .attr('class', cx('bar-chart-bar', classNames?.bar))
      .attr('x', (d) => xAxis(d.index))
      .attr('width', barWidth)
      // set minimal height for Bar
      .attr('y', (d) =>
        d.y && height - yAxis(d.y) < minBarHeight
          ? height - minBarHeight
          : yAxis(d.y),
      )
      .attr('height', (d) => {
        const initialHeight = height - yAxis(d.y)
        return initialHeight && initialHeight < minBarHeight
          ? minBarHeight
          : initialHeight
      })
      .attr('data-testid', (d) => `bar-${d.x}-${d.y}`)
      .on('mouseenter mousemove', (event, d) => {
        tooltip.style('opacity', 1)
        tooltip
          .html(tooltipValidation(d.y, d.index))
          .style('left', `${event.pageX + 16}px`)
          .style('top', `${event.pageY + 16}px`)
          .attr('data-testid', 'bar-tooltip')
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', 0)
      })

    return () => {
      tooltip.remove()
    }
  }, [data, width, height])

  if (!data.length) {
    return null
  }

  return (
    <>
      <TooltipGlobalStyles />
      <Wrapper style={{ width: propWidth, height: propHeight }}>
        <StyledSVG ref={svgRef} />
      </Wrapper>
    </>
  )
}

export default BarChart
