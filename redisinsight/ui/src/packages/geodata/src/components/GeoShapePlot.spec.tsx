import React from 'react'
import { render, screen } from '@testing-library/react'

import { GeoQueryOverlay, GeoShapeResult } from '../types'

const mockMapRemove = jest.fn()
const mockFitBounds = jest.fn()
const mockMap = {
  fitBounds: mockFitBounds,
  remove: mockMapRemove,
}

const mockPad = jest.fn(() => 'padded-bounds')
const mockExtend = jest.fn()
const mockIsValid = jest.fn(() => true)
const mockBounds = {
  extend: mockExtend,
  isValid: mockIsValid,
  pad: mockPad,
}

const mockShapeAddTo = jest.fn()
const mockShapeBindPopup = jest.fn((popup: HTMLElement) => ({
  popup,
  addTo: mockShapeAddTo,
}))
const mockShapeLayer = {
  bindPopup: mockShapeBindPopup,
}

const mockTileLayerAddTo = jest.fn()
const mockTileLayerOn = jest.fn()
const mockTileLayer = {
  addTo: mockTileLayerAddTo,
  on: mockTileLayerOn,
}

const mockLeaflet = {
  circleMarker: jest.fn(() => mockShapeLayer),
  latLngBounds: jest.fn(() => mockBounds),
  map: jest.fn(() => mockMap),
  polygon: jest.fn(() => mockShapeLayer),
  tileLayer: jest.fn(() => mockTileLayer),
}

jest.mock('leaflet', () => ({
  __esModule: true,
  ...mockLeaflet,
  default: mockLeaflet,
}))

const { GeoShapePlot } = require('./GeoShapePlot') as typeof import('./GeoShapePlot')

const originalNodeEnv = process.env.NODE_ENV

const polygonShape: GeoShapeResult = {
  id: 'shape:1',
  name: '<img src=x onerror=alert(1)>',
  field: 'geom',
  wkt: 'POLYGON ((1 1, 1 3, 3 3, 1 1))',
  geometry: {
    type: 'polygon',
    rings: [
      [
        { lon: 1, lat: 1 },
        { lon: 1, lat: 3 },
        { lon: 3, lat: 3 },
        { lon: 1, lat: 1 },
      ],
    ],
  },
}

const pointOverlay: GeoQueryOverlay = {
  type: 'shape',
  field: 'geom',
  operation: 'CONTAINS',
  wkt: 'POINT (2 2)',
  geometry: {
    type: 'point',
    lon: 2,
    lat: 2,
  },
}

describe('GeoShapePlot', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
    jest.clearAllMocks()
    mockIsValid.mockReturnValue(true)
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('renders polygon shapes and query point overlays with safe popups', () => {
    const { unmount } = render(
      <GeoShapePlot shapes={[polygonShape]} overlay={pointOverlay} />,
    )

    expect(
      screen.getByRole('img', { name: 'Leaflet geospatial shape plot' }),
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
    expect(mockLeaflet.polygon).toHaveBeenCalledWith(
      [[[1, 1], [3, 1], [3, 3], [1, 1]]],
      expect.objectContaining({ fillOpacity: 0.16 }),
    )
    expect(mockLeaflet.circleMarker).toHaveBeenCalledWith(
      [2, 2],
      expect.objectContaining({ fillColor: '#a00a6b' }),
    )
    expect(mockFitBounds).toHaveBeenCalledWith('padded-bounds', {
      animate: false,
    })

    const popup = mockShapeBindPopup.mock.calls[0][0] as HTMLElement
    expect(popup.textContent).toContain('<img src=x onerror=alert(1)>')
    expect(popup.querySelector('img')).toBeNull()

    unmount()
    expect(mockMapRemove).toHaveBeenCalled()
  })

  it('skips fitBounds when no valid bounds are available', () => {
    mockIsValid.mockReturnValue(false)

    render(<GeoShapePlot shapes={[]} />)

    expect(mockLeaflet.map).toHaveBeenCalled()
    expect(mockFitBounds).not.toHaveBeenCalled()
  })
})
