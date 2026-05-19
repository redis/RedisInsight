import React from 'react'
import { render } from '@testing-library/react'

import { GeoSearchVisualization } from './GeoSearchVisualization'
import { ParsedGeoCommand } from '../types'
import * as geoParser from '../utils/geoParser'

function mockGeoHeader() {
  return <div data-testid="geo-header" />
}

function mockGeoPlot() {
  return <div data-testid="geo-plot" />
}

function mockGeoTable() {
  return <div data-testid="geo-table" />
}

jest.mock('./GeoHeader', () => ({
  GeoHeader: mockGeoHeader,
}))
jest.mock('./GeoPlot', () => ({
  GeoPlot: mockGeoPlot,
}))
jest.mock('./GeoTable', () => ({
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
})
