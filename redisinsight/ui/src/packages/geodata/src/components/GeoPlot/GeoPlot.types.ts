import * as L from 'leaflet'

import { GeoResult, ParsedGeoCommand } from '../../types'

export interface GeoPlotProps {
  mode: 'markers' | 'heatmap'
  results: GeoResult[]
  command: ParsedGeoCommand
}

export interface DistanceThresholds {
  close: number
  middle: number
}

export interface DistanceMarkerOptions extends L.CircleMarkerOptions {
  distanceKm?: number
}

export interface ThresholdControlsProps {
  thresholds: DistanceThresholds
  onChange: (thresholds: DistanceThresholds) => void
}
