import * as L from 'leaflet'

import { GeoResult, ParsedGeoCommand } from '../../types'

export interface GeoPlotProps {
  mode: 'markers' | 'heatmap'
  results: GeoResult[]
  command: ParsedGeoCommand
}

export interface DistanceMarkerOptions extends L.CircleMarkerOptions {
  distanceKm?: number
}
