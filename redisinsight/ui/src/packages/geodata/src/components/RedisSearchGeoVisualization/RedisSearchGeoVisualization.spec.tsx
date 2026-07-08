import React from 'react'
import { render, screen } from '@testing-library/react'

import { RedisSearchGeoVisualization } from './RedisSearchGeoVisualization'
import { ParsedRedisSearchGeoCommand } from '../../types'
import * as redisSearchGeoParser from '../../utils/redisSearchGeoParser'

function mockGeoHeader() {
  return <div data-testid="geo-header" />
}

function mockGeoPlot() {
  return <div data-testid="geo-plot" />
}

function mockGeoShapePlot() {
  return <div data-testid="geo-shape-plot" />
}

function mockGeoTable() {
  return <div data-testid="geo-table" />
}

jest.mock('../GeoHeader', () => ({
  GeoHeader: mockGeoHeader,
}))
jest.mock('../GeoPlot', () => ({
  GeoPlot: mockGeoPlot,
}))
jest.mock('../GeoShapePlot', () => ({
  GeoShapePlot: mockGeoShapePlot,
}))
jest.mock('../GeoTable', () => ({
  GeoTable: mockGeoTable,
}))

const parsedCommand: ParsedRedisSearchGeoCommand = {
  command: 'FT.SEARCH',
  kind: 'pointRadius',
  rawTokens: ['FT.SEARCH', 'cities', '@coords:[2.34 48.86 1000 km]'],
  index: 'cities',
  query: '@coords:[2.34 48.86 1000 km]',
  geoField: 'coords',
  params: {},
  overlay: {
    type: 'radius',
    source: 'query',
    field: 'coords',
    lon: 2.34,
    lat: 48.86,
    radius: 1000,
    radiusKm: 1000,
    unit: 'km',
  },
}

describe('RedisSearchGeoVisualization', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('memoizes parsed command and results for stable inputs', () => {
    const response = [1, 'city:1', ['name', 'Paris', 'coords', '2.34,48.86']]
    const parseRedisSearchGeoCommand = jest
      .spyOn(redisSearchGeoParser, 'parseRedisSearchGeoCommand')
      .mockReturnValue({ ok: true, value: parsedCommand })
    const parseRedisSearchGeoResults = jest
      .spyOn(redisSearchGeoParser, 'parseRedisSearchGeoResults')
      .mockReturnValue({
        ok: true,
        value: {
          command: parsedCommand,
          points: [
            {
              id: 'city:1',
              name: 'Paris',
              field: 'coords',
              lon: 2.34,
              lat: 48.86,
            },
          ],
          shapes: [],
        },
      })

    const { rerender } = render(
      <RedisSearchGeoVisualization
        command='FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 coords'
        response={response}
        status="success"
        mode="markers"
      />,
    )

    rerender(
      <RedisSearchGeoVisualization
        command='FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 coords'
        response={response}
        status="success"
        mode="markers"
      />,
    )

    expect(parseRedisSearchGeoCommand).toHaveBeenCalledTimes(1)
    expect(parseRedisSearchGeoResults).toHaveBeenCalledTimes(1)
  })

  it('shows an inspector-specific error title when inspector results cannot be parsed', () => {
    jest
      .spyOn(redisSearchGeoParser, 'parseRedisSearchGeoCommand')
      .mockReturnValue({ ok: true, value: parsedCommand })
    jest.spyOn(redisSearchGeoParser, 'parseRedisSearchGeoResults').mockReturnValue({
      ok: false,
      error: 'Add RETURN 1 coords to the FT.SEARCH command.',
    })

    render(
      <RedisSearchGeoVisualization
        command='FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 name'
        response={[1, 'city:1', ['name', 'Paris']]}
        status="success"
        mode="inspector"
      />,
    )

    expect(
      screen.getByText('Cannot inspect Redis Search geo results'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Cannot render Redis Search geo map'),
    ).not.toBeInTheDocument()
  })

  it('shows a heatmap-specific error title when heatmap command parsing fails', () => {
    jest.spyOn(redisSearchGeoParser, 'parseRedisSearchGeoCommand').mockReturnValue({
      ok: false,
      error: 'No Redis Search geospatial predicate found.',
    })

    render(
      <RedisSearchGeoVisualization
        command='FT.SEARCH cities "*"'
        response={[0]}
        status="success"
        mode="heatmap"
      />,
    )

    expect(screen.getByText('Cannot render Redis Search geo heatmap')).toBeInTheDocument()
    expect(
      screen.queryByText('Cannot inspect Redis Search geo command'),
    ).not.toBeInTheDocument()
  })

  it('shows a heatmap-specific error title when heatmap results cannot be parsed', () => {
    jest
      .spyOn(redisSearchGeoParser, 'parseRedisSearchGeoCommand')
      .mockReturnValue({ ok: true, value: parsedCommand })
    jest.spyOn(redisSearchGeoParser, 'parseRedisSearchGeoResults').mockReturnValue({
      ok: false,
      error: 'Add RETURN 1 coords to the FT.SEARCH command.',
    })

    render(
      <RedisSearchGeoVisualization
        command='FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 name'
        response={[1, 'city:1', ['name', 'Paris']]}
        status="success"
        mode="heatmap"
      />,
    )

    expect(screen.getByText('Cannot render Redis Search geo heatmap')).toBeInTheDocument()
    expect(
      screen.queryByText('Cannot render Redis Search geo map'),
    ).not.toBeInTheDocument()
  })
})
