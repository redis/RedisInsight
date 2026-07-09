export type RqeGeoCommand = 'FT.SEARCH' | 'FT.AGGREGATE' | 'FT.HYBRID'

export type RqeGeoKind = 'pointRadius' | 'shape'

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
