import * as d3 from 'd3'
import React, { useEffect, useRef } from 'react'
import cx from 'classnames'
import { curryRight, flow, toNumber } from 'lodash'

import { formatBytes, toBytes } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface AreaChartData {
  y: number
  x: number
  xlabel: string
  ylabel: string
}

interface IDatum extends AreaChartData {
  index: number
}

export enum AreaChartDataType {
  Bytes = 'bytes',
}

export interface IProps {
  name?: string
  data?: AreaChartData[]
  dataType?: AreaChartDataType
  width?: number
  height?: number
  yCountTicks?: number
  divideLastColumn?: boolean
  multiplierGrid?: number
  classNames?: {
    area?: string
    dashedLine?: string
    tooltip?: string
    scatterPoints?: string
  }
  tooltipValidation?: (val: any, index: number) => string
  leftAxiosValidation?: (val: any, index: number) => any
  bottomAxiosValidation?: (val: any, index: number) => any
}

export const DEFAULT_MULTIPLIER_GRID = 2
export const DEFAULT_Y_TICKS = 4
let cleanedData: IDatum[] = []

const AreaChart = (props: IProps) => {
  const {
    data = [],
    name,
    width: propWidth = 0,
    height: propHeight = 0,
    yCountTicks = DEFAULT_Y_TICKS,
    dataType,
    classNames,
    divideLastColumn,
    multiplierGrid = DEFAULT_MULTIPLIER_GRID,
    tooltipValidation = (val) => val,
    leftAxiosValidation = (val) => val,
    bottomAxiosValidation = (val) => val,
  } = props

  const margin = { top: 10, right: 30, bottom: 32, left: 60 }
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
      .attr('class', cx(styles.tooltip, classNames?.tooltip || ''))
      .style('opacity', 0)

    d3.select(svgRef.current).select('g').remove()

    // append the svg object to the body of the page
    const svg = d3
      .select(svgRef.current)
      .attr('data-testid', `area-${name}`)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 30)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const area = d3
      .area<IDatum>()
      .x((d) => xAxis(d.index))
      .y0(height)
      .y1((d) => yAxis(d.y))
      .curve(d3.curveMonotoneX)

    cleanedData = data.map((datum, index) => ({
      index,
      xlabel: `${datum?.xlabel || ''}`,
      ylabel: `${datum?.ylabel || ''}`,
      y: datum.y,
      x: datum.x,
    }))

    const xAxis = d3
      .scaleLinear()
      .domain(d3.extent(cleanedData, (d) => d.index) as [number, number])
      .range([0, width])

    let maxY = d3.max(cleanedData, (d) => d.y) || yCountTicks

    if (dataType === AreaChartDataType.Bytes) {
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

    svg
      .append('path')
      .datum(cleanedData)
      .attr('fill', 'none')
      .attr('stroke', 'var(--euiColorPrimary)')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .line<IDatum>()
          .x((d) => xAxis(d.index))
          .y((d) => yAxis(d.y))
          .curve(d3.curveMonotoneX),
      )

    if (divideLastColumn) {
      svg
        .append('line')
        .attr('class', cx(styles.dashedLine, classNames?.dashedLine))
        .attr('x1', xAxis(cleanedData.length - 1.5))
        .attr('x2', xAxis(cleanedData.length - 1.5))
        .attr('y1', 0)
        .attr('y2', height)
    }

    svg
      .append('path')
      .datum(cleanedData)
      .attr('class', cx(styles.area, classNames?.area))
      .attr('d', area)

    svg.append('g').call(
      d3
        .axisLeft(yAxis)
        .tickSize(-width)
        .tickValues([...d3.range(0, maxY, maxY / yCountTicks), maxY])
        .tickFormat((d, i) => leftAxiosValidation(d, i))
        .tickPadding(10),
    )

    const yTicks = d3.selectAll('text')
    yTicks.attr('data-testid', (d, i) => `ytick-${d}-${i}`)

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

    svg
      .selectAll('circle')
      .data(cleanedData)
      .enter()
      .append('circle')
      .attr('class', cx(styles.scatterPoints, classNames?.scatterPoints || ''))
      .attr('cx', (d) => xAxis(d.index))
      .attr('cy', (d) => yAxis(d.y))
      .attr('r', 5)
      .attr('data-testid', (d) => `circle-${d.x}-${d.y}`)
      .raise()
      .on('mousemove mouseenter', (event, d) => {
        tooltip.transition().duration(200).style('opacity', 1)
        tooltip
          .html(tooltipValidation(d.y, d.index))
          .style(
            'left',
            `${event.pageX - (tooltip?.node()?.getBoundingClientRect()?.width || 0) / 2}px`,
          )
          .style('top', `${event.pageY - 66}px`)
          .attr('data-testid', 'area-tooltip-circle')
      })
      .on('mouseout', () => {
        tooltip.transition().duration(100).style('opacity', 0)
      })

    return () => {
      tooltip.remove()
    }
  }, [data, width, height])

  if (!data.length) {
    return null
  }

  return (
    <div
      className={styles.wrapper}
      style={{ width: propWidth, height: propHeight }}
    >
      <svg ref={svgRef} className={styles.svg} />
    </div>
  )
}

export default AreaChart
