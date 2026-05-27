import React from 'react'
import { render, screen } from '@testing-library/react'

import { RqeGeoVisualization } from './RqeGeoVisualization'
import { ParsedRqeGeoCommand } from '../../types'
import * as rqeGeoParser from '../../utils/rqeGeoParser'

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

const parsedCommand: ParsedRqeGeoCommand = {
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

describe('RqeGeoVisualization', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('memoizes parsed command and results for stable inputs', () => {
    const response = [1, 'city:1', ['name', 'Paris', 'coords', '2.34,48.86']]
    const parseRqeGeoCommand = jest
      .spyOn(rqeGeoParser, 'parseRqeGeoCommand')
      .mockReturnValue({ ok: true, value: parsedCommand })
    const parseRqeGeoResults = jest
      .spyOn(rqeGeoParser, 'parseRqeGeoResults')
      .mockReturnValue({
        ok: true,
        value: {
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
      <RqeGeoVisualization
        command='FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 coords'
        response={response}
        status="success"
        mode="markers"
      />,
    )

    rerender(
      <RqeGeoVisualization
        command='FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 coords'
        response={response}
        status="success"
        mode="markers"
      />,
    )

    expect(parseRqeGeoCommand).toHaveBeenCalledTimes(1)
    expect(parseRqeGeoResults).toHaveBeenCalledTimes(1)
  })

  it('shows an inspector-specific error title when inspector results cannot be parsed', () => {
    jest
      .spyOn(rqeGeoParser, 'parseRqeGeoCommand')
      .mockReturnValue({ ok: true, value: parsedCommand })
    jest.spyOn(rqeGeoParser, 'parseRqeGeoResults').mockReturnValue({
      ok: false,
      error: 'Add RETURN 1 coords to the FT.SEARCH command.',
    })

    render(
      <RqeGeoVisualization
        command='FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 name'
        response={[1, 'city:1', ['name', 'Paris']]}
        status="success"
        mode="inspector"
      />,
    )

    expect(
      screen.getByText('Cannot inspect RQE geo results'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Cannot render RQE geo map'),
    ).not.toBeInTheDocument()
  })

  it('shows a heatmap-specific error title when heatmap command parsing fails', () => {
    jest.spyOn(rqeGeoParser, 'parseRqeGeoCommand').mockReturnValue({
      ok: false,
      error: 'No Redis Query Engine geospatial predicate found.',
    })

    render(
      <RqeGeoVisualization
        command='FT.SEARCH cities "*"'
        response={[0]}
        status="success"
        mode="heatmap"
      />,
    )

    expect(screen.getByText('Cannot render RQE geo heatmap')).toBeInTheDocument()
    expect(
      screen.queryByText('Cannot inspect RQE geo command'),
    ).not.toBeInTheDocument()
  })

  it('shows a heatmap-specific error title when heatmap results cannot be parsed', () => {
    jest
      .spyOn(rqeGeoParser, 'parseRqeGeoCommand')
      .mockReturnValue({ ok: true, value: parsedCommand })
    jest.spyOn(rqeGeoParser, 'parseRqeGeoResults').mockReturnValue({
      ok: false,
      error: 'Add RETURN 1 coords to the FT.SEARCH command.',
    })

    render(
      <RqeGeoVisualization
        command='FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 name'
        response={[1, 'city:1', ['name', 'Paris']]}
        status="success"
        mode="heatmap"
      />,
    )

    expect(screen.getByText('Cannot render RQE geo heatmap')).toBeInTheDocument()
    expect(
      screen.queryByText('Cannot render RQE geo map'),
    ).not.toBeInTheDocument()
  })
})
