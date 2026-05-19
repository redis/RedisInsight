import { DISTANCE_THRESHOLDS } from '../constants'
import { DistanceThresholds } from './GeoPlot.types'

export const EARTH_RADIUS_KM = 6371

export const DEFAULT_DISTANCE_THRESHOLDS: DistanceThresholds = {
  close: DISTANCE_THRESHOLDS.close,
  middle: DISTANCE_THRESHOLDS.middle,
}

export const UNIT_TO_KM: Record<string, number> = {
  M: 0.001,
  KM: 1,
  FT: 0.0003048,
  MI: 1.609344,
}
