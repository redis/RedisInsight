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

export const DISTANCE_COLORS = {
  close: '#008556',
  middle: '#9c5c2b',
  far: '#a00a6b',
}

export const HEAT_COLORS = ['#008556', '#00a382', '#d9822b', '#a00a6b']
