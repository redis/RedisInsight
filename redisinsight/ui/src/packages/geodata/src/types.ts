export type GeoCommand =
  | 'GEOADD'
  | 'GEODIST'
  | 'GEOHASH'
  | 'GEOPOS'
  | 'GEORADIUS'
  | 'GEORADIUS_RO'
  | 'GEORADIUSBYMEMBER'
  | 'GEORADIUSBYMEMBER_RO'
  | 'GEOSEARCH'
  | 'GEOSEARCHSTORE'

export type RqeGeoCommand = 'FT.SEARCH' | 'FT.AGGREGATE' | 'FT.HYBRID'

export type RqeGeoKind = 'pointRadius' | 'shape'

export type GeoShapeOperation =
  | 'WITHIN'
  | 'CONTAINS'
  | 'INTERSECTS'
  | 'DISJOINT'

export type GeoCommandKind =
  | 'addSummary'
  | 'distance'
  | 'hashList'
  | 'pointList'
  | 'searchResults'
  | 'storeSummary'

export type SearchType = 'radius' | 'box' | 'unknown'

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

export interface GeoAddPoint {
  lon: number
  lat: number
  member: string
}

export interface ParsedGeoCommand {
  command: GeoCommand
  kind: GeoCommandKind
  rawTokens: string[]
  key?: string
  destinationKey?: string
  members?: string[]
  points?: GeoAddPoint[]
  addOptions?: string[]
  memberName?: string
  centerFromMember?: boolean
  centerLon?: number
  centerLat?: number
  radius?: number
  boxWidth?: number
  boxHeight?: number
  unit?: string
  searchType: SearchType
  withCoord?: boolean
  withDist?: boolean
  withHash?: boolean
  order?: 'ASC' | 'DESC'
  count?: number
  isAnyCount?: boolean
  storeKey?: string
  storeDistKey?: string
  storeDist?: boolean
}

export interface GeoResult {
  name: string
  lon: number
  lat: number
  distance?: number
  hash?: number
}

export interface GeoShapePoint {
  lon: number
  lat: number
}

export type GeoShapeGeometry =
  | {
    type: 'point'
    lon: number
    lat: number
  }
  | {
    type: 'polygon'
    rings: GeoShapePoint[][]
  }

export interface GeoPointResult {
  id: string
  name: string
  field: string
  lon: number
  lat: number
}

export interface GeoShapeResult {
  id: string
  name: string
  field: string
  wkt: string
  geometry: GeoShapeGeometry
}

export type GeoQueryOverlay =
  | {
    type: 'radius'
    source: 'query' | 'geofilter'
    field: string
    lon: number
    lat: number
    radius: number
    radiusKm: number
    unit: string
  }
  | {
    type: 'shape'
    field: string
    operation: GeoShapeOperation
    wkt: string
    geometry: GeoShapeGeometry
  }

export interface ParsedRqeGeoCommand {
  command: RqeGeoCommand
  kind: RqeGeoKind
  rawTokens: string[]
  index: string
  query: string
  geoField: string
  params: Record<string, string>
  overlay: GeoQueryOverlay
}

export interface RqeGeoDataset {
  command: ParsedRqeGeoCommand
  points: GeoPointResult[]
  shapes: GeoShapeResult[]
}

export interface GeoPositionResult {
  member: string
  lon?: number
  lat?: number
  missing: boolean
}

export interface GeoHashResult {
  member: string
  hash: string | null
}

export interface GeoDistanceResult {
  distance: number | null
  unit: string
}

export interface GeoIntegerResult {
  count: number
  label: string
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
  limits: {
    maxMapPoints: number
    maxTableRows: number
  }
}
