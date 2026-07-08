export type RedisSearchGeoCommand = 'FT.SEARCH' | 'FT.AGGREGATE' | 'FT.HYBRID'

export type RedisSearchGeoKind = 'pointRadius' | 'shape'

export type GeoShapeOperation =
  | 'WITHIN'
  | 'CONTAINS'
  | 'INTERSECTS'
  | 'DISJOINT'

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

export interface ParsedRedisSearchGeoCommand {
  command: RedisSearchGeoCommand
  kind: RedisSearchGeoKind
  rawTokens: string[]
  index: string
  query: string
  geoField: string
  params: Record<string, string>
  overlay: GeoQueryOverlay
}

export interface RedisSearchGeoDataset {
  command: ParsedRedisSearchGeoCommand
  points: GeoPointResult[]
  shapes: GeoShapeResult[]
}
