export enum GeodataMode {
  Markers = 'markers',
  Heatmap = 'heatmap',
  Inspector = 'inspector',
  RedisSearchMarkers = 'rqe-markers',
  RedisSearchHeatmap = 'rqe-heatmap',
  RedisSearchInspector = 'rqe-inspector',
  RedisSearchShape = 'rqe-shape',
}

export interface WorkbenchResult {
  response: unknown
  status: string
}

export interface PluginProps {
  command?: string
  data?: WorkbenchResult[]
  mode?: string
}

export interface GeoConfig {
  tiles: {
    enabled: boolean
    urlTemplate: string
    attribution: string
    maxZoom?: number
  }
}
