export interface DistanceThresholds {
  close: number
  middle: number
}

export interface DistanceThresholdControlsProps {
  thresholds: DistanceThresholds
  onChange: (thresholds: DistanceThresholds) => void
}
