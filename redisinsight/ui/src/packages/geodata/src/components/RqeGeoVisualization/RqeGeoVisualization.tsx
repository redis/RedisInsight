import React, { useMemo } from 'react'

import { GeoHeader } from '../GeoHeader'
import { GeoPlot } from '../GeoPlot'
import { GeoShapePlot } from '../GeoShapePlot'
import { GeoSummary } from '../GeoSummary'
import { GeoTable } from '../GeoTable'
import { Message } from '../Message'
import { Shell } from '../Shell'
import {
  GeoPointResult,
  GeoShapeResult,
  ParsedGeoCommand,
  ParsedRqeGeoCommand,
} from '../../types'
import {
  parseRqeGeoCommand,
  parseRqeGeoResults,
} from '../../utils/rqeGeoParser'

interface RqeGeoVisualizationProps {
  command: string
  response: unknown
  status: string
  mode: 'markers' | 'heatmap' | 'inspector' | 'shape'
}

const getTitle = (mode: RqeGeoVisualizationProps['mode']): string => {
  if (mode === 'markers') {
    return 'Search geospatial map'
  }
  if (mode === 'heatmap') {
    return 'Search geospatial heatmap'
  }
  if (mode === 'shape') {
    return 'Search geoshape map'
  }
  return 'Search geospatial details'
}

const getResultsErrorTitle = (
  mode: RqeGeoVisualizationProps['mode'],
): string => {
  if (mode === 'shape') {
    return 'Cannot render Redis Search geo shape'
  }
  if (mode === 'heatmap') {
    return 'Cannot render Redis Search geo heatmap'
  }
  if (mode === 'inspector') {
    return 'Cannot inspect Redis Search geo results'
  }
  return 'Cannot render Redis Search geo map'
}

const getCommandErrorTitle = (
  mode: RqeGeoVisualizationProps['mode'],
): string => {
  if (mode === 'inspector') {
    return 'Cannot inspect Redis Search geo command'
  }
  return getResultsErrorTitle(mode)
}

const toNativeGeoCommand = (command: ParsedRqeGeoCommand): ParsedGeoCommand => {
  if (command.overlay.type !== 'radius') {
    return {
      command: 'GEOSEARCH',
      kind: 'searchResults',
      rawTokens: command.rawTokens,
      searchType: 'unknown',
      withCoord: true,
    }
  }

  return {
    command: 'GEOSEARCH',
    kind: 'searchResults',
    rawTokens: command.rawTokens,
    searchType: 'radius',
    key: command.index,
    centerLon: command.overlay.lon,
    centerLat: command.overlay.lat,
    radius: command.overlay.radiusKm,
    unit: 'km',
    withCoord: true,
  }
}

const getPointRows = (points: GeoPointResult[]) =>
  points.map((point) => [
    point.name,
    point.id,
    point.field,
    point.lon,
    point.lat,
  ])

const getShapeRows = (shapes: GeoShapeResult[]) =>
  shapes.map((shape) => [shape.name, shape.id, shape.field, shape.wkt])

const renderSummary = (command: ParsedRqeGeoCommand, rowCount: number) => {
  const overlayValue =
    command.overlay.type === 'radius'
      ? `${command.overlay.radius} ${command.overlay.unit}`
      : command.overlay.operation

  return (
    <GeoSummary
      ariaLabel="Redis Search command summary"
      items={[
        { label: 'Command', value: command.command },
        { label: 'Index', value: command.index },
        { label: 'Geo field', value: command.geoField },
        {
          label: command.overlay.type === 'radius' ? 'Radius' : 'Operation',
          value: overlayValue,
        },
        { label: 'Rows', value: rowCount },
      ]}
    />
  )
}

export const RqeGeoVisualization = ({
  command,
  response,
  status,
  mode,
}: RqeGeoVisualizationProps) => {
  const title = getTitle(mode)
  const parsedCommand = useMemo(() => parseRqeGeoCommand(command), [command])
  const parsedResults = useMemo(
    () =>
      parsedCommand.ok
        ? parseRqeGeoResults(response, parsedCommand.value)
        : { ok: false as const, error: parsedCommand.error },
    [parsedCommand, response],
  )
  const pointRows = useMemo(
    () => (parsedResults?.ok ? getPointRows(parsedResults.value.points) : []),
    [parsedResults],
  )
  const shapeRows = useMemo(
    () => (parsedResults?.ok ? getShapeRows(parsedResults.value.shapes) : []),
    [parsedResults],
  )
  const nativeGeoCommand = useMemo<ParsedGeoCommand>(
    () =>
      parsedCommand.ok
        ? toNativeGeoCommand(parsedCommand.value)
        : {
            command: 'GEOSEARCH',
            kind: 'searchResults',
            rawTokens: [],
            searchType: 'unknown',
            withCoord: true,
          },
    [parsedCommand],
  )
  const mapPoints = useMemo(
    () =>
      parsedResults?.ok
        ? parsedResults.value.points.map((point) => ({
            name: point.name,
            lon: point.lon,
            lat: point.lat,
          }))
        : [],
    [parsedResults],
  )

  if (!parsedCommand.ok) {
    return (
      <Shell>
        <GeoHeader title={title} status={status} resultCount={0} />
        <Message title={getCommandErrorTitle(mode)} variant="danger">
          {parsedCommand.error}
        </Message>
      </Shell>
    )
  }

  if (!parsedResults.ok) {
    return (
      <Shell>
        <GeoHeader title={title} status={status} resultCount={0} />
        <Message title={getResultsErrorTitle(mode)} variant="danger">
          {parsedResults.error}
        </Message>
      </Shell>
    )
  }

  const { points, shapes } = parsedResults.value
  if (mode === 'shape') {
    return (
      <Shell>
        <GeoHeader title={title} status={status} resultCount={shapes.length} />
        {shapes.length === 0 ? (
          <Message>No geospatial shapes returned.</Message>
        ) : (
          <>
            <GeoShapePlot
              shapes={shapes}
              overlay={parsedCommand.value.overlay}
            />
            {renderSummary(parsedCommand.value, shapes.length)}
            <GeoTable
              columns={['Name', 'ID', 'Field', 'WKT']}
              rows={shapeRows}
            />
          </>
        )}
      </Shell>
    )
  }

  if (mode === 'inspector') {
    return (
      <Shell>
        <GeoHeader
          title={title}
          status={status}
          resultCount={points.length + shapes.length}
        />
        {renderSummary(parsedCommand.value, points.length + shapes.length)}
        {points.length > 0 && (
          <GeoTable
            columns={['Name', 'ID', 'Field', 'Longitude', 'Latitude']}
            rows={pointRows}
          />
        )}
        {shapes.length > 0 && (
          <GeoTable columns={['Name', 'ID', 'Field', 'WKT']} rows={shapeRows} />
        )}
      </Shell>
    )
  }

  return (
    <Shell>
      <GeoHeader title={title} status={status} resultCount={points.length} />
      {points.length === 0 ? (
        <Message>No geospatial rows returned.</Message>
      ) : (
        <>
          <GeoPlot mode={mode} results={mapPoints} command={nativeGeoCommand} />
          <GeoTable
            columns={['Name', 'ID', 'Field', 'Longitude', 'Latitude']}
            rows={pointRows}
          />
        </>
      )}
    </Shell>
  )
}
