import { GeoConfig } from '../types'

export const DEFAULT_GEO_CONFIG: GeoConfig = {
  tiles: {
    enabled: true,
    urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: 'OpenStreetMap contributors',
    maxZoom: 19,
  },
}

export const MAP_FIT_BOUNDS_PADDING_RATIO = 0.32

export const MAP_INITIAL_MAX_ZOOM = 12

export const CLUSTER_MIN_POINTS = 50

export const MAP_COLORS = {
  primary: '#00a382',
  query: '#a00a6b',
  stroke: '#ffffff',
}
