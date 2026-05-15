import * as L from 'leaflet'
import React, { useEffect, useRef } from 'react'

import 'leaflet.heat'
import 'leaflet.markercluster'

import {
  CLUSTER_MIN_POINTS,
  DEFAULT_GEO_CONFIG,
  DISTANCE_COLORS,
  DISTANCE_THRESHOLDS,
  HEAT_COLORS,
  MAP_COLORS,
  MAP_FIT_BOUNDS_PADDING_RATIO,
  MAP_INITIAL_MAX_ZOOM,
  THRESHOLD_VISIBLE_ZOOM,
} from '../constants'
import { GeoResult, ParsedGeoCommand } from '../types'

interface GeoPlotProps {
  mode: 'markers' | 'heatmap'
  results: GeoResult[]
  command: ParsedGeoCommand
}

interface DistanceThresholds {
  close: number
  middle: number
}

interface DistanceMarkerOptions extends L.CircleMarkerOptions {
  distanceKm?: number
}

const EARTH_RADIUS_KM = 6371

const DEFAULT_DISTANCE_THRESHOLDS: DistanceThresholds = {
  close: DISTANCE_THRESHOLDS.close,
  middle: DISTANCE_THRESHOLDS.middle,
}

const UNIT_TO_KM: Record<string, number> = {
  M: 0.001,
  KM: 1,
  FT: 0.0003048,
  MI: 1.609344,
}

const toRadians = (value: number): number => (value * Math.PI) / 180

const toKm = (value: number, unit = 'km'): number =>
  value * (UNIT_TO_KM[unit.toUpperCase()] ?? 1)

const getRawDistanceUnit = (command: ParsedGeoCommand): string => {
  const upperTokens = command.rawTokens.map((token) => token.toUpperCase())

  if (command.command === 'GEOSEARCH') {
    const radiusIndex = upperTokens.indexOf('BYRADIUS')
    if (radiusIndex >= 0) {
      return command.rawTokens[radiusIndex + 2] || command.unit || 'km'
    }
  }

  if (command.command === 'GEORADIUS' || command.command === 'GEORADIUS_RO') {
    return command.rawTokens[5] || command.unit || 'km'
  }

  if (
    command.command === 'GEORADIUSBYMEMBER' ||
    command.command === 'GEORADIUSBYMEMBER_RO'
  ) {
    return command.rawTokens[4] || command.unit || 'km'
  }

  return command.unit || 'km'
}

const calculateDistanceKm = (
  result: GeoResult,
  command: ParsedGeoCommand,
): number | undefined => {
  if (result.distance !== undefined) {
    return toKm(result.distance, getRawDistanceUnit(command))
  }

  if (command.centerLat === undefined || command.centerLon === undefined) {
    return undefined
  }

  const latDelta = toRadians(result.lat - command.centerLat)
  const lonDelta = toRadians(result.lon - command.centerLon)
  const startLat = toRadians(command.centerLat)
  const endLat = toRadians(result.lat)
  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lonDelta / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

const getDistanceScaleKm = (
  results: GeoResult[],
  command: ParsedGeoCommand,
): number => {
  if (command.searchType === 'radius' && command.radius !== undefined) {
    return command.radius
  }

  return Math.max(
    ...results.map((result) => calculateDistanceKm(result, command) ?? 0),
    0,
  )
}

const getPointColor = (
  distanceKm: number | undefined,
  distanceScaleKm: number,
  thresholds: DistanceThresholds,
): string => {
  if (distanceKm === undefined || distanceScaleKm <= 0) {
    return DISTANCE_COLORS.middle
  }

  const ratio = Math.min(distanceKm / distanceScaleKm, 1)
  if (ratio <= thresholds.close) {
    return DISTANCE_COLORS.close
  }
  if (ratio <= thresholds.middle) {
    return DISTANCE_COLORS.middle
  }
  return DISTANCE_COLORS.far
}

const createClusterIcon = (
  cluster: L.MarkerCluster,
  distanceScaleKm: number,
  thresholds: DistanceThresholds,
): L.DivIcon => {
  const childMarkers = cluster.getAllChildMarkers()
  const distances = childMarkers
    .map((marker) => (marker.options as DistanceMarkerOptions).distanceKm)
    .filter((distance): distance is number => distance !== undefined)
  const averageDistance =
    distances.length === 0
      ? undefined
      : distances.reduce((sum, distance) => sum + distance, 0) / distances.length
  const count = childMarkers.length
  const size = count > 100 ? 50 : count > 10 ? 40 : 30
  const node = document.createElement('div')

  node.className = 'geodata-cluster-icon'
  node.style.setProperty(
    '--geodata-current-cluster-color',
    getPointColor(averageDistance, distanceScaleKm, thresholds),
  )
  node.style.width = `${size}px`
  node.style.height = `${size}px`
  node.style.fontSize = count > 100 ? '16px' : count > 10 ? '14px' : '12px'
  node.textContent = String(count)

  return L.divIcon({
    className: 'geodata-cluster',
    html: node,
    iconSize: [size, size],
  })
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
): void => {
  if (command.centerLat === undefined || command.centerLon === undefined) {
    return
  }

  const center: L.LatLngExpression = [command.centerLat, command.centerLon]
  if (command.searchType === 'radius' && command.radius !== undefined) {
    L.circle(center, {
      radius: command.radius * 1000,
      color: MAP_COLORS.primary,
      fillColor: MAP_COLORS.primary,
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
        color: MAP_COLORS.primary,
        fillColor: MAP_COLORS.primary,
        fillOpacity: 0.08,
        weight: 1,
        dashArray: '4 4',
      },
    ).addTo(map)
  }
}

const addMarkers = (
  map: L.Map,
  results: GeoResult[],
  command: ParsedGeoCommand,
  distanceScaleKm: number,
  thresholds: DistanceThresholds,
  markersRef: React.MutableRefObject<L.CircleMarker[]>,
): L.LayerGroup | L.MarkerClusterGroup => {
  const useCluster = results.length >= CLUSTER_MIN_POINTS
  const markerLayer = useCluster
    ? L.markerClusterGroup({
        disableClusteringAtZoom: THRESHOLD_VISIBLE_ZOOM,
        iconCreateFunction: (cluster) =>
          createClusterIcon(cluster, distanceScaleKm, thresholds),
      })
    : L.layerGroup()

  results.forEach((result) => {
    const distanceKm = calculateDistanceKm(result, command)
    const marker = L.circleMarker([result.lat, result.lon], {
      radius: 7,
      color: MAP_COLORS.stroke,
      weight: 1,
      fillColor: getPointColor(distanceKm, distanceScaleKm, thresholds),
      fillOpacity: 0.9,
      distanceKm,
    } as DistanceMarkerOptions).bindPopup(createPopup(result))

    markersRef.current.push(marker)
    markerLayer.addLayer(marker)
  })

  markerLayer.addTo(map)
  return markerLayer
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
        0.2: HEAT_COLORS[0],
        0.5: HEAT_COLORS[1],
        0.75: HEAT_COLORS[2],
        1: HEAT_COLORS[3],
      },
    },
  ).addTo(map)
}

interface ThresholdControlsProps {
  thresholds: DistanceThresholds
  onChange: (thresholds: DistanceThresholds) => void
}

const DistanceThresholdControls = ({
  thresholds,
  onChange,
}: ThresholdControlsProps) => {
  const [expanded, setExpanded] = React.useState(false)
  const isDefault =
    thresholds.close === DEFAULT_DISTANCE_THRESHOLDS.close &&
    thresholds.middle === DEFAULT_DISTANCE_THRESHOLDS.middle

  const updateClose = (value: number) => {
    onChange({
      close: Math.min(value, thresholds.middle - 0.05),
      middle: thresholds.middle,
    })
  }

  const updateMiddle = (value: number) => {
    onChange({
      close: thresholds.close,
      middle: Math.max(value, thresholds.close + 0.05),
    })
  }

  return (
    <div className="geodata-threshold-panel" data-testid="threshold-controls">
      <div className="geodata-threshold-header">
        <button
          type="button"
          className="geodata-threshold-toggle"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          Distance thresholds
        </button>
        {expanded && (
          <button
            type="button"
            className="geodata-threshold-reset"
            onClick={() => onChange(DEFAULT_DISTANCE_THRESHOLDS)}
            disabled={isDefault}
          >
            Reset
          </button>
        )}
      </div>
      {expanded && (
        <div className="geodata-threshold-sliders">
          <label className="geodata-threshold-slider geodata-threshold-slider--close">
            <span>Close {Math.round(thresholds.close * 100)}%</span>
            <input
              type="range"
              min="0.2"
              max="0.6"
              step="0.05"
              value={thresholds.close}
              onChange={(event) => updateClose(Number(event.target.value))}
              aria-label="Close threshold"
            />
          </label>
          <label className="geodata-threshold-slider geodata-threshold-slider--middle">
            <span>Mid {Math.round(thresholds.middle * 100)}%</span>
            <input
              type="range"
              min="0.6"
              max="0.95"
              step="0.05"
              value={thresholds.middle}
              onChange={(event) => updateMiddle(Number(event.target.value))}
              aria-label="Mid threshold"
            />
          </label>
        </div>
      )}
    </div>
  )
}

const tileConfig = DEFAULT_GEO_CONFIG.tiles

export const GeoPlot = ({ mode, results, command }: GeoPlotProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.CircleMarker[]>([])
  const markerLayerRef = useRef<L.LayerGroup | L.MarkerClusterGroup | null>(null)
  const distanceScaleRef = useRef<number>(0)
  const [tileNotice, setTileNotice] = React.useState<string | null>(
    tileConfig.enabled ? null : 'Map tiles disabled',
  )
  const [thresholds, setThresholds] = React.useState<DistanceThresholds>(
    DEFAULT_DISTANCE_THRESHOLDS,
  )
  const thresholdsRef = useRef<DistanceThresholds>(thresholds)
  const [showThresholdControls, setShowThresholdControls] =
    React.useState(false)
  const distanceScaleKm = getDistanceScaleKm(results, command)

  useEffect(() => {
    if (!mapRef.current || process.env.NODE_ENV === 'test') {
      return undefined
    }

    const map = L.map(mapRef.current, {
      attributionControl: tileConfig.enabled,
      zoomControl: true,
      preferCanvas: true,
    })
    const bounds = getBounds(results)
    let removeZoomListener: (() => void) | undefined

    markersRef.current = []
    markerLayerRef.current = null
    distanceScaleRef.current = distanceScaleKm
    setTileNotice(tileConfig.enabled ? null : 'Map tiles disabled')
    if (tileConfig.enabled && tileConfig.urlTemplate) {
      const tileLayer = L.tileLayer(tileConfig.urlTemplate, {
        attribution: tileConfig.attribution,
        maxZoom: tileConfig.maxZoom,
      })
      tileLayer.on('tileerror', () => setTileNotice('Map tiles unavailable'))
      tileLayer.addTo(map)
    }

    addSearchShape(map, command)
    if (mode === 'heatmap') {
      addHeatmap(map, results)
      setShowThresholdControls(false)
    } else {
      const useCluster = results.length >= CLUSTER_MIN_POINTS
      markerLayerRef.current = addMarkers(
        map,
        results,
        command,
        distanceScaleKm,
        thresholdsRef.current,
        markersRef,
      )

      if (useCluster) {
        const updateThresholdVisibility = () =>
          setShowThresholdControls(map.getZoom() >= THRESHOLD_VISIBLE_ZOOM)

        updateThresholdVisibility()
        map.on('zoomend', updateThresholdVisibility)
        removeZoomListener = () => map.off('zoomend', updateThresholdVisibility)
      } else {
        setShowThresholdControls(true)
      }
    }

    map.fitBounds(bounds.pad(MAP_FIT_BOUNDS_PADDING_RATIO), {
      animate: false,
      maxZoom: MAP_INITIAL_MAX_ZOOM,
    })

    return () => {
      removeZoomListener?.()
      map.remove()
      markersRef.current = []
      markerLayerRef.current = null
    }
  }, [command, distanceScaleKm, mode, results])

  useEffect(() => {
    thresholdsRef.current = thresholds

    markersRef.current.forEach((marker) => {
      const distanceKm = (marker.options as DistanceMarkerOptions).distanceKm
      marker.setStyle({
        fillColor: getPointColor(distanceKm, distanceScaleRef.current, thresholds),
      })
    })

    const markerLayer = markerLayerRef.current
    if (markerLayer && 'refreshClusters' in markerLayer) {
      markerLayer.refreshClusters()
    }
  }, [thresholds])

  return (
    <section
      className="geodata-plot-panel"
      aria-label={mode === 'markers' ? 'Geospatial map' : 'Geospatial heatmap'}
    >
      {mode === 'markers' && showThresholdControls && (
        <DistanceThresholdControls
          thresholds={thresholds}
          onChange={setThresholds}
        />
      )}
      {tileNotice && <div className="geodata-offline-note">{tileNotice}</div>}
      <div
        ref={mapRef}
        className="geodata-plot"
        role="img"
        aria-label="Leaflet geospatial plot"
      />
    </section>
  )
}
