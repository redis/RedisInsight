import { DISTANCE_THRESHOLDS } from '../constants'
import { DistanceThresholds } from './GeoPlot.types'

export const EARTH_RADIUS_KM = 6371

export const DEFAULT_DISTANCE_THRESHOLDS: DistanceThresholds = {
  close: DISTANCE_THRESHOLDS.close,
  middle: DISTANCE_THRESHOLDS.middle,
}
