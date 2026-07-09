export enum GeodataMode {
  Markers = 'markers',
  Heatmap = 'heatmap',
  Inspector = 'inspector',
  RqeMarkers = 'rqe-markers',
  RqeHeatmap = 'rqe-heatmap',
  RqeInspector = 'rqe-inspector',
  RqeShape = 'rqe-shape',
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
