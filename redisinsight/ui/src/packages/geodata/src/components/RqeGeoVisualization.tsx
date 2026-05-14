import React from 'react'

import { GeoHeader } from './GeoHeader'
import { GeoPlot } from './GeoPlot'
import { GeoShapePlot } from './GeoShapePlot'
import { GeoTable } from './GeoTable'
import { Message } from './Message'
import {
  GeoPointResult,
  GeoShapeResult,
  ParsedGeoCommand,
  ParsedRqeGeoCommand,
} from '../types'
import { parseRqeGeoCommand, parseRqeGeoResults } from '../utils/rqeGeoParser'

interface RqeGeoVisualizationProps {
  command: string
  response: unknown
  status: string
  mode: 'markers' | 'heatmap' | 'inspector' | 'shape'
}

const getTitle = (mode: RqeGeoVisualizationProps['mode']): string => {
  if (mode === 'markers') {
    return 'RQE Geo Map'
  }
  if (mode === 'heatmap') {
    return 'RQE Geo Heatmap'
  }
  if (mode === 'shape') {
    return 'RQE Geo Shape'
  }
  return 'RQE Geo Inspector'
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

const renderSummary = (
  command: ParsedRqeGeoCommand,
  rowCount: number,
) => {
  const overlayValue =
    command.overlay.type === 'radius'
      ? `${command.overlay.radius} ${command.overlay.unit}`
      : command.overlay.operation

  return (
    <dl className="geodata-summary-grid" aria-label="RQE command summary">
      <div>
        <dt>Command</dt>
        <dd>{command.command}</dd>
      </div>
      <div>
        <dt>Index</dt>
        <dd>{command.index}</dd>
      </div>
      <div>
        <dt>Geo field</dt>
        <dd>{command.geoField}</dd>
      </div>
      <div>
        <dt>{command.overlay.type === 'radius' ? 'Radius' : 'Operation'}</dt>
        <dd>{overlayValue}</dd>
      </div>
      <div>
        <dt>Rows</dt>
        <dd>{rowCount}</dd>
      </div>
    </dl>
  )
}

export const RqeGeoVisualization = ({
  command,
  response,
  status,
  mode,
}: RqeGeoVisualizationProps) => {
  const title = getTitle(mode)
  const parsedCommand = parseRqeGeoCommand(command)

  if (!parsedCommand.ok) {
    return (
      <div className="geodata-shell">
        <GeoHeader title={title} command={command} status={status} resultCount={0} />
        <Message title="Cannot inspect RQE geo command">{parsedCommand.error}</Message>
      </div>
    )
  }

  const parsedResults = parseRqeGeoResults(response, parsedCommand.value)
  if (!parsedResults.ok) {
    return (
      <div className="geodata-shell">
        <GeoHeader title={title} command={command} status={status} resultCount={0} />
        <Message title={`Cannot render ${mode === 'shape' ? 'RQE geo shape' : 'RQE geo map'}`}>
          {parsedResults.error}
        </Message>
      </div>
    )
  }

  const { points, shapes } = parsedResults.value
  if (mode === 'shape') {
    return (
      <div className="geodata-shell">
        <GeoHeader title={title} command={command} status={status} resultCount={shapes.length} />
        {renderSummary(parsedCommand.value, shapes.length)}
        {shapes.length === 0 ? (
          <Message>No geospatial shapes returned.</Message>
        ) : (
          <>
            <GeoShapePlot shapes={shapes} overlay={parsedCommand.value.overlay} />
            <GeoTable
              columns={['Name', 'ID', 'Field', 'WKT']}
              rows={getShapeRows(shapes)}
            />
          </>
        )}
      </div>
    )
  }

  if (mode === 'inspector') {
    return (
      <div className="geodata-shell">
        <GeoHeader
          title={title}
          command={command}
          status={status}
          resultCount={points.length + shapes.length}
        />
        {renderSummary(parsedCommand.value, points.length + shapes.length)}
        {points.length > 0 && (
          <GeoTable
            columns={['Name', 'ID', 'Field', 'Longitude', 'Latitude']}
            rows={getPointRows(points)}
          />
        )}
        {shapes.length > 0 && (
          <GeoTable
            columns={['Name', 'ID', 'Field', 'WKT']}
            rows={getShapeRows(shapes)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="geodata-shell">
      <GeoHeader title={title} command={command} status={status} resultCount={points.length} />
      {points.length === 0 ? (
        <Message>No geospatial rows returned.</Message>
      ) : (
        <>
          <GeoPlot
            mode={mode}
            results={points.map((point) => ({
              name: point.name,
              lon: point.lon,
              lat: point.lat,
            }))}
            command={toNativeGeoCommand(parsedCommand.value)}
          />
          <GeoTable
            columns={['Name', 'ID', 'Field', 'Longitude', 'Latitude']}
            rows={getPointRows(points)}
          />
        </>
      )}
    </div>
  )
}
