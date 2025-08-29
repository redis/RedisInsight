import React, { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-dist-min'
import {
  Layout,
  LayoutAxis,
  Legend,
  PlotData,
  PlotMouseEvent,
  PlotRelayoutEvent,
} from 'plotly.js'
import { format } from 'date-fns'
import {
  COLORS,
  COLORS_DARK,
  GoodColorPicker,
  hexToRGBA,
  IGoodColor,
} from './utils'

import { Datapoint, GraphMode, ChartProps, PlotlyEvents } from './interfaces'

const GRAPH_MODE_MAP: { [mode: string]: 'lines' | 'markers' } = {
  [GraphMode.line]: 'lines',
  [GraphMode.points]: 'markers',
}

const isDarkTheme = document.body.classList.contains('theme_DARK')

const colorPicker = (COLORS: IGoodColor[]) => {
  const color = new GoodColorPicker(COLORS)
  return (label: string) => color.getColor(label).color
}

const labelColors = colorPicker(isDarkTheme ? COLORS_DARK : COLORS)

export default function Chart(props: ChartProps) {
  const chartContainer = useRef<any>()

  const colorPicker = labelColors

  useEffect(() => {
    Plotly.newPlot(chartContainer.current, getData(props), getLayout(props), {
      displayModeBar: false,
      autosizable: true,
      responsive: true,
      setBackground: () => 'transparent',
    })
    chartContainer.current.on(
      PlotlyEvents.PLOTLY_HOVER,
      function (eventdata: PlotMouseEvent) {
        const points = eventdata.points[0]
        const pointNum = points.pointNumber
        Plotly.Fx.hover(
          chartContainer.current,
          props.data.map((_, i) => ({
            curveNumber: i,
            pointNumber: pointNum,
          })),
          Object.keys(chartContainer.current._fullLayout._plots),
        )
      },
    )
    chartContainer.current.on(
      PlotlyEvents.PLOTLY_RELAYOUT,
      function (eventdata: PlotRelayoutEvent) {
        if (
          eventdata.autosize === undefined &&
          eventdata['xaxis.autorange'] === undefined
        ) {
          props.onRelayout()
        }
      },
    )

    chartContainer.current.on(PlotlyEvents.PLOTLY_DBLCLICK, () =>
      props.onDoubleClick(),
    )
  }, [props.chartConfig])

  function getData(props: ChartProps): Partial<PlotData>[] {
    return props.data.map((timeSeries) => {
      /*
       * Time format for inclusion of milliseconds:
       * https://github.com/moment/moment/issues/4864#issuecomment-440142542
       */
      const x = selectCol(timeSeries.datapoints, 0).map((time: number) =>
        format(time, 'yyyy-MM-dd HH:mm:ss.SSS'),
      )
      const y = selectCol(timeSeries.datapoints, 1)

      return {
        x,
        y,
        yaxis:
          props.chartConfig.yAxis2 &&
          props.chartConfig.keyToY2Axis[timeSeries.key]
            ? 'y2'
            : 'y',
        name: timeSeries.key,
        type: 'scatter',
        marker: { color: colorPicker(timeSeries.key) },
        fill: props.chartConfig.fill ? 'tozeroy' : undefined,
        fillcolor: hexToRGBA(colorPicker(timeSeries.key), 0.3),
        mode: GRAPH_MODE_MAP[props.chartConfig.mode],
        line: { shape: props.chartConfig.staircase ? 'hv' : 'spline' },
      }
    })
  }

  function getLayout(props: ChartProps): Partial<Layout> {
    const axisConfig: { [key: string]: Partial<LayoutAxis> } = {
      xaxis: {
        title: props.chartConfig.xlabel,
        rangeslider: {
          visible: true,
          thickness: 0.03,
          bgcolor: isDarkTheme ? '#3D3D3D' : '#CDD7EA',
          bordercolor: 'red',
        },
        color: isDarkTheme ? '#898A90' : '#527298',
      },
      yaxis: {
        title: props.chartConfig.yAxisConfig.label,
        type: props.chartConfig.yAxisConfig.scale,
        fixedrange: true,
        color: isDarkTheme ? '#898A90' : '#527298',
        gridcolor: isDarkTheme ? '#898A90' : '#527298',
      },
      yaxis2: {
        visible: props.chartConfig.yAxis2,
        title: props.chartConfig.yAxis2Config.label,
        type: props.chartConfig.yAxis2Config.scale,
        overlaying: 'y',
        side: 'right',
        fixedrange: true,
        color: isDarkTheme ? '#8191CF' : '#6E6E6E',
        gridcolor: isDarkTheme ? '#8191CF' : '#6E6E6E',
      } as LayoutAxis,
    }

    const legend: Partial<Legend> = {
      xanchor: 'center',
      yanchor: 'top',
      x: 0.5,
      y: -0.5,
      orientation: 'h',
    }
    return {
      ...axisConfig,
      legend,
      showlegend: true,
      title: props.chartConfig.title,
      uirevision: 1,
      autosize: true,
      font: { color: isDarkTheme ? 'darkgrey' : 'black' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: {
        pad: 6,
      },
    }
  }

  function selectCol(twoDArray: Datapoint[], colIndex: number) {
    return twoDArray.map((arr) => arr[colIndex])
  }

  return <div ref={chartContainer}></div>
}
