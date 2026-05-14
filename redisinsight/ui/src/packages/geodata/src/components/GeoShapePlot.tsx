import * as L from 'leaflet'
import React, { useEffect, useRef } from 'react'

import { DEFAULT_GEO_CONFIG } from '../constants'
import { GeoQueryOverlay, GeoShapeGeometry, GeoShapeResult } from '../types'

interface GeoShapePlotProps {
  shapes: GeoShapeResult[]
  overlay?: GeoQueryOverlay
}

const createPopup = (name: string, field: string): HTMLElement => {
  const container = document.createElement('div')
  const title = document.createElement('strong')
  const fieldNode = document.createElement('div')

  title.textContent = name
  fieldNode.textContent = `Field: ${field}`
  container.append(title, fieldNode)

  return container
}

const getGeometryBounds = (geometry: GeoShapeGeometry): L.LatLngExpression[] => {
  if (geometry.type === 'point') {
    return [[geometry.lat, geometry.lon]]
  }

  return geometry.rings.flatMap((ring) =>
    ring.map(({ lon, lat }): L.LatLngExpression => [lat, lon]),
  )
}

const addGeometry = (
  map: L.Map,
  geometry: GeoShapeGeometry,
  name: string,
  field: string,
  options: L.PathOptions,
): void => {
  if (geometry.type === 'point') {
    L.circleMarker([geometry.lat, geometry.lon], {
      radius: 7,
      color: '#ffffff',
      weight: 1,
      fillColor: options.color || '#00a382',
      fillOpacity: 0.9,
    })
      .bindPopup(createPopup(name, field))
      .addTo(map)
    return
  }

  L.polygon(
    geometry.rings.map((ring) =>
      ring.map(({ lon, lat }): L.LatLngExpression => [lat, lon]),
    ),
    options,
  )
    .bindPopup(createPopup(name, field))
    .addTo(map)
}

const tileConfig = DEFAULT_GEO_CONFIG.tiles

export const GeoShapePlot = ({ shapes, overlay }: GeoShapePlotProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [tileNotice, setTileNotice] = React.useState<string | null>(
    tileConfig.enabled ? null : 'Map tiles disabled',
  )

  useEffect(() => {
    if (!mapRef.current || process.env.NODE_ENV === 'test') {
      return undefined
    }

    const map = L.map(mapRef.current, {
      attributionControl: tileConfig.enabled,
      zoomControl: true,
      preferCanvas: true,
    })
    const bounds = L.latLngBounds([])

    setTileNotice(tileConfig.enabled ? null : 'Map tiles disabled')
    if (tileConfig.enabled && tileConfig.urlTemplate) {
      const tileLayer = L.tileLayer(tileConfig.urlTemplate, {
        attribution: tileConfig.attribution,
        maxZoom: tileConfig.maxZoom,
      })
      tileLayer.on('tileerror', () => setTileNotice('Map tiles unavailable'))
      tileLayer.addTo(map)
    }

    shapes.forEach((shape) => {
      addGeometry(map, shape.geometry, shape.name, shape.field, {
        color: '#00a382',
        fillColor: '#00a382',
        fillOpacity: 0.16,
        weight: 2,
      })
      getGeometryBounds(shape.geometry).forEach((point) => bounds.extend(point))
    })

    if (overlay?.type === 'shape') {
      addGeometry(map, overlay.geometry, `${overlay.operation} query`, overlay.field, {
        color: '#a00a6b',
        fillColor: '#a00a6b',
        fillOpacity: 0.08,
        weight: 1,
        dashArray: '4 4',
      })
      getGeometryBounds(overlay.geometry).forEach((point) => bounds.extend(point))
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.18), { animate: false })
    }

    return () => {
      map.remove()
    }
  }, [overlay, shapes])

  return (
    <section className="geodata-plot-panel" aria-label="RQE Geo Shape">
      {tileNotice && <div className="geodata-offline-note">{tileNotice}</div>}
      <div
        ref={mapRef}
        className="geodata-plot"
        role="img"
        aria-label="Leaflet geospatial shape plot"
      />
    </section>
  )
}
