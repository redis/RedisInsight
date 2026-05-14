import * as L from 'leaflet'
import React, { useEffect, useRef } from 'react'

import 'leaflet.heat'
import 'leaflet.markercluster'

import { DISTANCE_COLORS } from '../constants'
import { GeoResult, ParsedGeoCommand } from '../types'

interface GeoPlotProps {
  mode: 'markers' | 'heatmap'
  results: GeoResult[]
  command: ParsedGeoCommand
}

const getPointColor = (result: GeoResult, maxDistance: number): string => {
  if (result.distance === undefined || maxDistance <= 0) {
    return DISTANCE_COLORS.close
  }

  const ratio = result.distance / maxDistance
  if (ratio < 0.5) {
    return DISTANCE_COLORS.close
  }
  if (ratio < 0.85) {
    return DISTANCE_COLORS.middle
  }
  return DISTANCE_COLORS.far
}

const createPopup = (result: GeoResult): HTMLElement => {
  const container = document.createElement('div')
  const title = document.createElement('strong')
  const coordinates = document.createElement('div')

  title.textContent = result.name
  coordinates.textContent = `${result.lon}, ${result.lat}`
  container.append(title, coordinates)

  if (result.distance !== undefined) {
    const distance = document.createElement('div')
    distance.textContent = `Distance: ${result.distance}`
    container.append(distance)
  }

  if (result.hash !== undefined) {
    const hash = document.createElement('div')
    hash.textContent = `Hash: ${result.hash}`
    container.append(hash)
  }

  return container
}

const getBounds = (results: GeoResult[]): L.LatLngBounds =>
  L.latLngBounds(results.map(({ lat, lon }) => [lat, lon]))

const addSearchShape = (
  map: L.Map,
  command: ParsedGeoCommand,
  bounds: L.LatLngBounds,
): void => {
  if (command.centerLat === undefined || command.centerLon === undefined) {
    return
  }

  const center: L.LatLngExpression = [command.centerLat, command.centerLon]
  if (command.searchType === 'radius' && command.radius !== undefined) {
    L.circle(center, {
      radius: command.radius * 1000,
      color: '#00a382',
      fillColor: '#00a382',
      fillOpacity: 0.08,
      weight: 1,
      dashArray: '4 4',
    }).addTo(map)
    return
  }

  if (
    command.searchType === 'box' &&
    command.boxWidth !== undefined &&
    command.boxHeight !== undefined
  ) {
    const latDelta = command.boxHeight / 111
    const lonDelta = command.boxWidth / 111
    L.rectangle(
      [
        [command.centerLat - latDelta / 2, command.centerLon - lonDelta / 2],
        [command.centerLat + latDelta / 2, command.centerLon + lonDelta / 2],
      ],
      {
        color: '#00a382',
        fillColor: '#00a382',
        fillOpacity: 0.08,
        weight: 1,
        dashArray: '4 4',
      },
    ).addTo(map)
  }

  bounds.extend(center)
}

const addMarkers = (
  map: L.Map,
  results: GeoResult[],
  maxDistance: number,
): void => {
  const markerLayer =
    results.length > 50 ? L.markerClusterGroup() : L.layerGroup()

  results.forEach((result) => {
    const color = getPointColor(result, maxDistance)
    const marker =
      results.length > 50
        ? L.marker([result.lat, result.lon], {
            icon: L.divIcon({
              className: 'geodata-div-marker',
              html: '',
              iconSize: [12, 12],
            }),
          })
        : L.circleMarker([result.lat, result.lon], {
            radius: 7,
            color: '#ffffff',
            weight: 1,
            fillColor: color,
            fillOpacity: 0.9,
          })

    marker.bindPopup(createPopup(result))
    markerLayer.addLayer(marker)
  })

  markerLayer.addTo(map)
}

const addHeatmap = (map: L.Map, results: GeoResult[]): void => {
  L.heatLayer(
    results.map(({ lat, lon, distance = 1 }) => [
      lat,
      lon,
      Math.max(0.25, distance),
    ]),
    {
      radius: 24,
      blur: 18,
      minOpacity: 0.28,
      gradient: {
        0.2: '#008556',
        0.5: '#00a382',
        0.75: '#d9822b',
        1: '#a00a6b',
      },
    },
  ).addTo(map)
}

export const GeoPlot = ({ mode, results, command }: GeoPlotProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const maxDistance = Math.max(
    ...results.map(({ distance = 0 }) => distance),
    0,
  )

  useEffect(() => {
    if (!mapRef.current || process.env.NODE_ENV === 'test') {
      return undefined
    }

    const map = L.map(mapRef.current, {
      attributionControl: false,
      zoomControl: true,
      preferCanvas: true,
    })
    const bounds = getBounds(results)

    addSearchShape(map, command, bounds)
    if (mode === 'heatmap') {
      addHeatmap(map, results)
    } else {
      addMarkers(map, results, maxDistance)
    }

    map.fitBounds(bounds.pad(0.18), { animate: false })

    return () => {
      map.remove()
    }
  }, [command, maxDistance, mode, results])

  return (
    <section
      className="geodata-plot-panel"
      aria-label={mode === 'markers' ? 'Geo Map' : 'Geo Heatmap'}
    >
      <div className="geodata-offline-note">Map tiles disabled</div>
      <div
        ref={mapRef}
        className="geodata-plot"
        role="img"
        aria-label="Leaflet geospatial plot"
      />
    </section>
  )
}
