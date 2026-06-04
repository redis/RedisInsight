import React from 'react'
import { render, screen } from '@testing-library/react'

import { GeoSearchVisualization } from './GeoSearchVisualization'
import { ParsedGeoCommand } from '../../types'
import * as geoParser from '../../utils/geoParser'

function mockGeoHeader() {
  return <div data-testid="geo-header" />
}

function mockGeoPlot() {
  return <div data-testid="geo-plot" />
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
jest.mock('../GeoTable', () => ({
  GeoTable: mockGeoTable,
}))

const parsedCommand: ParsedGeoCommand = {
  command: 'GEOSEARCH',
  kind: 'searchResults',
  rawTokens: [
    'GEOSEARCH',
    'Sicily',
    'FROMLONLAT',
    '15',
    '37',
    'BYRADIUS',
    '300',
    'km',
    'WITHCOORD',
  ],
  searchType: 'radius',
  key: 'Sicily',
  centerLon: 15,
  centerLat: 37,
  radius: 300,
  withCoord: true,
}

describe('GeoSearchVisualization', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('memoizes parsed command and results for stable inputs', () => {
    const response = [['Palermo', ['13.361389', '38.115556']]]
    const parseSearchParams = jest
      .spyOn(geoParser, 'parseSearchParams')
      .mockReturnValue({ ok: true, value: parsedCommand })
    const parseGeoSearchResults = jest
      .spyOn(geoParser, 'parseGeoSearchResults')
      .mockReturnValue({
        ok: true,
        value: [{ name: 'Palermo', lon: 13.361389, lat: 38.115556 }],
      })

    const { rerender } = render(
      <GeoSearchVisualization
        command="GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHCOORD"
        response={response}
        status="success"
        mode="markers"
      />,
    )

    rerender(
      <GeoSearchVisualization
        command="GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHCOORD"
        response={response}
        status="success"
        mode="markers"
      />,
    )

    expect(parseSearchParams).toHaveBeenCalledTimes(1)
    expect(parseGeoSearchResults).toHaveBeenCalledTimes(1)
  })

  it('shows a heatmap-specific parse error title in heatmap mode', () => {
    jest
      .spyOn(geoParser, 'parseSearchParams')
      .mockReturnValue({ ok: false, error: 'Invalid search command.' })

    render(
      <GeoSearchVisualization
        command="GEOSEARCH Sicily FROMLONLAT bad 37 BYRADIUS 300 km WITHCOORD"
        response={[]}
        status="fail"
        mode="heatmap"
      />,
    )

    expect(screen.getByText('Cannot render heatmap')).toBeInTheDocument()
    expect(screen.queryByText('Cannot render map')).not.toBeInTheDocument()
  })

  it('shows a heatmap-specific result error title in heatmap mode', () => {
    jest
      .spyOn(geoParser, 'parseSearchParams')
      .mockReturnValue({ ok: true, value: parsedCommand })
    jest.spyOn(geoParser, 'parseGeoSearchResults').mockReturnValue({
      ok: false,
      error: 'Unexpected GEOSEARCH result row.',
    })

    render(
      <GeoSearchVisualization
        command="GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHCOORD"
        response={['bad-row']}
        status="fail"
        mode="heatmap"
      />,
    )

    expect(screen.getByText('Cannot render heatmap')).toBeInTheDocument()
    expect(screen.queryByText('Cannot render map')).not.toBeInTheDocument()
  })
})
