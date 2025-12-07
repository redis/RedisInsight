import cx from 'classnames'
import * as d3 from 'd3'
import { isString, sumBy } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Nullable, truncateNumberToRange } from 'uiSrc/utils'
import { rgb, RGBColor } from 'uiSrc/utils/colors'
import { getPercentage } from 'uiSrc/utils/numbers'

import {
  Wrapper,
  InnerTextContainer,
  Tooltip,
  StyledSVG,
} from './DonutChart.styles'

export interface ChartData {
  value: number
  name: string
  color: RGBColor | string
  meta?: {
    [key: string]: any
  }
}

export interface IProps {
  name?: string
  data: ChartData[]
  width?: number
  height?: number
  title?: React.ReactElement | string
  config?: {
    percentToShowLabel?: number
    arcWidth?: number
    margin?: number
    radius?: number
  }
  classNames?: {
    chart?: string
    arc?: string
    arcLabel?: string
    arcLabelValue?: string
    tooltip?: string
  }
  renderLabel?: (data: ChartData) => string
  renderTooltip?: (data: ChartData) => React.ReactElement | string
  labelAs?: 'value' | 'percentage'
  hideLabelTitle?: boolean
}

const ANIMATION_DURATION_MS = 100

const DonutChart = (props: IProps) => {
  const {
    name = '',
    data,
    width = 380,
    height = 300,
    title,
    config,
    classNames,
    labelAs = 'value',
    renderLabel,
    renderTooltip,
    hideLabelTitle = false,
  } = props

  const margin = config?.margin || 98
  const radius = config?.radius || width / 2 - margin
  const arcWidth = config?.arcWidth || 8
  const percentToShowLabel = config?.percentToShowLabel ?? 5

  const [hoveredData, setHoveredData] = useState<Nullable<ChartData>>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const sum = sumBy(data, 'value')

  const arc = d3
    .arc<d3.PieArcDatum<ChartData>>()
    .outerRadius(radius)
    .innerRadius(radius - arcWidth)

  const arcHover = d3
    .arc<d3.PieArcDatum<ChartData>>()
    .outerRadius(radius + 4)
    .innerRadius(radius - arcWidth)

  const onMouseEnterSlice = (e: MouseEvent, d: d3.PieArcDatum<ChartData>) => {
    d3.select<SVGPathElement, d3.PieArcDatum<ChartData>>(
      e.target as SVGPathElement,
    )
      .transition()
      .duration(ANIMATION_DURATION_MS)
      .attr('d', arcHover)

    if (!tooltipRef.current) {
      return
    }

    // calculate position after tooltip rendering (do update as synchronous operation)
    if (e.type === 'mouseenter') {
      flushSync(() => {
        setHoveredData(d.data)
      })
    }

    tooltipRef.current.style.top = `${e.pageY + 15}px`
    tooltipRef.current.style.left =
      window.innerWidth < tooltipRef.current.scrollWidth + e.pageX + 20
        ? `${e.pageX - tooltipRef.current.scrollWidth - 15}px`
        : `${e.pageX + 15}px`
    tooltipRef.current.style.visibility = 'visible'
  }

  const onMouseLeaveSlice = (e: MouseEvent) => {
    d3.select<SVGPathElement, d3.PieArcDatum<ChartData>>(
      e.target as SVGPathElement,
    )
      .transition()
      .duration(ANIMATION_DURATION_MS)
      .attr('d', arc)

    if (tooltipRef.current) {
      tooltipRef.current.style.visibility = 'hidden'
      setHoveredData(null)
    }
  }

  const isShowLabel = (d: d3.PieArcDatum<ChartData>) =>
    percentToShowLabel > 0
      ? d.endAngle - d.startAngle > (Math.PI * 2) / (100 / percentToShowLabel)
      : true

  const getLabelPosition = (d: d3.PieArcDatum<ChartData>) => {
    const [x, y] = arc.centroid(d)
    const h = Math.sqrt(x * x + y * y)
    return `translate(${(x / h) * (radius + 12)}, ${((y + 4) / h) * (radius + 12)})`
  }

  useEffect(() => {
    d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .select('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)
  }, [height, width])

  useEffect(() => {
    const pie = d3
      .pie<ChartData>()
      .value((d: ChartData) => d.value)
      .sort(null)
    const dataReady = pie(data.filter((d) => d.value !== 0))

    d3.select(svgRef.current).select('g').remove()

    const svgElement = svgRef.current
    const existingClasses = svgElement?.getAttribute('class') || ''

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('data-testid', `donut-svg-${name}`)
      .attr('class', cx(existingClasses, classNames?.chart))
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    // add arcs
    svg
      .selectAll()
      .data(dataReady)
      .enter()
      .append('path')
      .attr('data-testid', (d) => `arc-${d.data.name}-${d.data.value}`)
      .attr('d', arc)
      .attr('fill', (d) =>
        isString(d.data.color) ? d.data.color : rgb(d.data.color),
      )
      .attr('class', cx('donut-arc', classNames?.arc))
      .on('mouseenter mousemove', onMouseEnterSlice)
      .on('mouseleave', onMouseLeaveSlice)

    // add labels
    svg
      .selectAll()
      .data(dataReady)
      .enter()
      .append('text')
      .attr('class', cx('donut-label', classNames?.arcLabel))
      .attr('transform', getLabelPosition)
      .text((d) =>
        isShowLabel(d) && !hideLabelTitle ? `${d.data.name}: ` : '',
      )
      .attr('data-testid', (d) => `label-${d.data.name}-${d.data.value}`)
      .style('text-anchor', (d) =>
        (d.endAngle + d.startAngle) / 2 > Math.PI ? 'end' : 'start',
      )
      .on('mouseenter mousemove', onMouseEnterSlice)
      .on('mouseleave', onMouseLeaveSlice)
      .append('tspan')
      .text((d) => {
        if (!isShowLabel(d)) {
          return ''
        }

        if (renderLabel) {
          return renderLabel(d.data)
        }

        if (labelAs === 'percentage') {
          return `${getPercentage(d.value, sum)}%`
        }

        return truncateNumberToRange(d.value)
      })
      .attr('class', cx('donut-label-value', classNames?.arcLabelValue))
  }, [data, hideLabelTitle])

  if (!data.length || sum === 0) {
    return null
  }

  return (
    <Wrapper data-testid={`donut-${name}`}>
      <StyledSVG ref={svgRef} />
      <Tooltip
        className={cx(classNames?.tooltip)}
        data-testid="chart-value-tooltip"
        ref={tooltipRef}
      >
        {renderTooltip && hoveredData
          ? renderTooltip(hoveredData)
          : hoveredData?.value || ''}
      </Tooltip>
      {title && <InnerTextContainer>{title}</InnerTextContainer>}
    </Wrapper>
  )
}

export default DonutChart
