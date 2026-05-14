import React from 'react'
import { render, screen } from '@testing-library/react'

import { GeoResult, ParsedGeoCommand } from '../types'

const mockMapRemove = jest.fn()
const mockFitBounds = jest.fn()
const mockMap = {
  fitBounds: mockFitBounds,
  remove: mockMapRemove,
}

const mockPad = jest.fn(() => 'padded-bounds')
const mockExtend = jest.fn()
const mockBounds = {
  pad: mockPad,
  extend: mockExtend,
}

const mockShapeAddTo = jest.fn()
const mockShapeLayer = {
  addTo: mockShapeAddTo,
}

const mockMarkerLayerAddLayer = jest.fn()
const mockMarkerLayerAddTo = jest.fn()
const mockMarkerLayer = {
  addLayer: mockMarkerLayerAddLayer,
  addTo: mockMarkerLayerAddTo,
}

const mockBindPopup = jest.fn()
const mockMarker = {
  bindPopup: mockBindPopup,
}

const mockTileLayerAddTo = jest.fn()
const mockTileLayerOn = jest.fn()
const mockTileLayer = {
  addTo: mockTileLayerAddTo,
  on: mockTileLayerOn,
}

const mockLeaflet = {
  circle: jest.fn(() => mockShapeLayer),
  circleMarker: jest.fn(() => mockMarker),
  divIcon: jest.fn((options) => options),
  heatLayer: jest.fn(() => mockShapeLayer),
  latLngBounds: jest.fn(() => mockBounds),
  layerGroup: jest.fn(() => mockMarkerLayer),
  map: jest.fn(() => mockMap),
  marker: jest.fn(() => mockMarker),
  markerClusterGroup: jest.fn(() => mockMarkerLayer),
  rectangle: jest.fn(() => mockShapeLayer),
  tileLayer: jest.fn(() => mockTileLayer),
}

jest.mock('leaflet', () => ({
  __esModule: true,
  ...mockLeaflet,
  default: mockLeaflet,
}))

jest.mock('leaflet.heat', () => ({}))
jest.mock('leaflet.markercluster', () => ({}))

// Require after the Leaflet mock is initialized; Jest hoists mock declarations above imports.
const { GeoPlot } = require('./GeoPlot') as typeof import('./GeoPlot')

const originalNodeEnv = process.env.NODE_ENV

const radiusCommand: ParsedGeoCommand = {
  command: 'GEOSEARCH',
  kind: 'searchResults',
  rawTokens: [],
  searchType: 'radius',
  key: 'Sicily',
  centerLon: 15,
  centerLat: 37,
  radius: 300,
  withCoord: true,
}

const boxCommand: ParsedGeoCommand = {
  command: 'GEOSEARCH',
  kind: 'searchResults',
  rawTokens: [],
  searchType: 'box',
  key: 'Sicily',
  centerLon: 15,
  centerLat: 37,
  boxWidth: 20,
  boxHeight: 10,
  withCoord: true,
}

const results: GeoResult[] = [
  {
    name: '<img src=x onerror=alert(1)>',
    lon: 13.361389,
    lat: 38.115556,
    distance: 10,
  },
  { name: 'Catania', lon: 15.087269, lat: 37.502669, distance: 100, hash: 123 },
]

describe('GeoPlot', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('renders marker plots with radius search shape and safe popups', () => {
    const { unmount } = render(
      <GeoPlot mode="markers" results={results} command={radiusCommand} />,
    )

    expect(
      screen.getByRole('img', { name: 'Leaflet geospatial plot' }),
    ).toBeInTheDocument()
    expect(mockLeaflet.map).toHaveBeenCalled()
    expect(mockLeaflet.tileLayer).toHaveBeenCalledWith(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      expect.objectContaining({
        attribution: 'OpenStreetMap contributors',
        maxZoom: 19,
      }),
    )
    expect(mockTileLayerAddTo).toHaveBeenCalledWith(mockMap)
    expect(screen.queryByText('Map tiles disabled')).not.toBeInTheDocument()
    expect(mockLeaflet.latLngBounds).toHaveBeenCalledWith([
      [38.115556, 13.361389],
      [37.502669, 15.087269],
    ])
    expect(mockLeaflet.circle).toHaveBeenCalledWith(
      [37, 15],
      expect.objectContaining({ radius: 300000 }),
    )
    expect(mockLeaflet.layerGroup).toHaveBeenCalled()
    expect(mockLeaflet.circleMarker).toHaveBeenCalledTimes(2)
    expect(mockMarkerLayerAddLayer).toHaveBeenCalledTimes(2)

    const popup = mockBindPopup.mock.calls[0][0] as HTMLElement
    expect(popup.textContent).toContain('<img src=x onerror=alert(1)>')
    expect(popup.querySelector('img')).toBeNull()

    unmount()
    expect(mockMapRemove).toHaveBeenCalled()
  })

  it('renders heatmaps with box search shape', () => {
    render(<GeoPlot mode="heatmap" results={results} command={boxCommand} />)

    expect(
      screen.getByRole('img', { name: 'Leaflet geospatial plot' }),
    ).toBeInTheDocument()
    expect(mockLeaflet.rectangle).toHaveBeenCalledWith(
      expect.arrayContaining([
        [expect.any(Number), expect.any(Number)],
        [expect.any(Number), expect.any(Number)],
      ]),
      expect.objectContaining({ fillOpacity: 0.08 }),
    )
    expect(mockExtend).toHaveBeenCalledWith([37, 15])
    expect(mockLeaflet.heatLayer).toHaveBeenCalledWith(
      [
        [38.115556, 13.361389, 10],
        [37.502669, 15.087269, 100],
      ],
      expect.objectContaining({ radius: 24 }),
    )
    expect(mockFitBounds).toHaveBeenCalledWith('padded-bounds', {
      animate: false,
    })
  })

  it('uses clustered markers for large result sets', () => {
    const manyResults = Array.from({ length: 51 }, (_, index) => ({
      name: `member-${index}`,
      lat: 37 + index / 100,
      lon: 15 + index / 100,
    }))

    render(
      <GeoPlot mode="markers" results={manyResults} command={radiusCommand} />,
    )

    expect(mockLeaflet.markerClusterGroup).toHaveBeenCalled()
    expect(mockLeaflet.marker).toHaveBeenCalledTimes(51)
    expect(mockLeaflet.divIcon).toHaveBeenCalledWith({
      className: 'geodata-div-marker',
      html: '',
      iconSize: [12, 12],
    })
  })

  it('uses the middle distance color for mid-range points', () => {
    render(
      <GeoPlot
        mode="markers"
        results={[
          { name: 'Middle', lat: 37, lon: 15, distance: 70 },
          { name: 'Far', lat: 38, lon: 16, distance: 100 },
        ]}
        command={radiusCommand}
      />,
    )

    expect(mockLeaflet.circleMarker).toHaveBeenNthCalledWith(
      1,
      [37, 15],
      expect.objectContaining({ fillColor: '#9c5c2b' }),
    )
  })

  it('skips search shapes when no center is available', () => {
    render(
      <GeoPlot
        mode="heatmap"
        results={[{ name: 'Palermo', lon: 13.361389, lat: 38.115556 }]}
        command={{
          ...radiusCommand,
          centerLat: undefined,
          centerLon: undefined,
        }}
      />,
    )

    expect(mockLeaflet.circle).not.toHaveBeenCalled()
    expect(mockLeaflet.rectangle).not.toHaveBeenCalled()
    expect(mockLeaflet.heatLayer).toHaveBeenCalledWith(
      [[38.115556, 13.361389, 1]],
      expect.any(Object),
    )
  })
})
