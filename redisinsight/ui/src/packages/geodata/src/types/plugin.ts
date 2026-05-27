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
