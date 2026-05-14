import * as L from 'leaflet'
import React, { useEffect, useRef } from 'react'

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

export const GeoShapePlot = ({ shapes, overlay }: GeoShapePlotProps) => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current || process.env.NODE_ENV === 'test') {
      return undefined
    }

    const map = L.map(mapRef.current, {
      attributionControl: false,
      zoomControl: true,
      preferCanvas: true,
    })
    const bounds = L.latLngBounds([])

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
      <div className="geodata-offline-note">Map tiles disabled</div>
      <div
        ref={mapRef}
        className="geodata-plot"
        role="img"
        aria-label="Leaflet geospatial shape plot"
      />
    </section>
  )
}
