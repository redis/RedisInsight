import React from 'react'

import { GeoHeader } from './GeoHeader'
import { GeoPlot } from './GeoPlot'
import { GeoTable } from './GeoTable'
import { Message } from './Message'
import { parseGeoSearchResults, parseSearchParams } from '../utils/geoParser'

interface GeoSearchVisualizationProps {
  command: string
  response: unknown
  status: string
  mode: 'markers' | 'heatmap'
}

export const GeoSearchVisualization = ({
  command,
  response,
  status,
  mode,
}: GeoSearchVisualizationProps) => {
  const parsedCommand = parseSearchParams(command)
  const title = mode === 'markers' ? 'Geospatial map' : 'Geospatial heatmap'

  if (!parsedCommand.ok) {
    return (
      <div className="geodata-shell">
        <GeoHeader title={title} status={status} resultCount={0} />
        <Message title="Cannot render map">{parsedCommand.error}</Message>
      </div>
    )
  }

  const parsedResults = parseGeoSearchResults(response, parsedCommand.value)
  if (!parsedResults.ok) {
    return (
      <div className="geodata-shell">
        <GeoHeader title={title} status={status} resultCount={0} />
        <Message title="Cannot render map">{parsedResults.error}</Message>
      </div>
    )
  }

  const results = parsedResults.value
  return (
    <div className="geodata-shell">
      <GeoHeader title={title} status={status} resultCount={results.length} />
      {results.length === 0 ? (
        <Message>No geospatial rows returned.</Message>
      ) : (
        <>
          <GeoPlot mode={mode} results={results} command={parsedCommand.value} />
          <GeoTable
            columns={['Member', 'Longitude', 'Latitude', 'Distance', 'Hash']}
            rows={results.map((result) => [
              result.name,
              result.lon,
              result.lat,
              result.distance === undefined ? '-' : result.distance,
              result.hash === undefined ? '-' : result.hash,
            ])}
          />
        </>
      )}
    </div>
  )
}
