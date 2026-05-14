import { GeoConfig } from './types'

export const MAP_WITHCOORD_ERROR =
  'Geo map visualizations require WITHCOORD in the Redis command.'

export const DEFAULT_GEO_CONFIG: GeoConfig = {
  tiles: {
    enabled: true,
    urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: 'OpenStreetMap contributors',
    maxZoom: 19,
  },
  limits: {
    maxMapPoints: 5000,
    maxTableRows: 10000,
  },
}

export const MAP_FIT_BOUNDS_PADDING_RATIO = 0.32

export const MAP_INITIAL_MAX_ZOOM = 12

export const CLUSTER_MIN_POINTS = 50

export const DISTANCE_THRESHOLDS = {
  close: 0.5,
  middle: 0.85,
}

export const THRESHOLD_VISIBLE_ZOOM = 12

export const DISTANCE_COLORS = {
  close: '#008556',
  middle: '#9c5c2b',
  far: '#a00a6b',
}

export const HEAT_COLORS = ['#008556', '#00a382', '#d9822b', '#a00a6b']

export const MAP_COLORS = {
  primary: '#00a382',
  query: '#a00a6b',
  stroke: '#ffffff',
}
