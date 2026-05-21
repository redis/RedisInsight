import React, { useMemo } from 'react'

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

const getErrorTitle = (mode: GeoSearchVisualizationProps['mode']): string =>
  mode === 'markers' ? 'Cannot render map' : 'Cannot render heatmap'

export const GeoSearchVisualization = ({
  command,
  response,
  status,
  mode,
}: GeoSearchVisualizationProps) => {
  const parsedCommand = useMemo(() => parseSearchParams(command), [command])
  const title = mode === 'markers' ? 'Geospatial map' : 'Geospatial heatmap'
  const errorTitle = getErrorTitle(mode)
  const parsedResults = useMemo(
    () =>
      parsedCommand.ok
        ? parseGeoSearchResults(response, parsedCommand.value)
        : null,
    [parsedCommand, response],
  )
  const rows = useMemo(
    () =>
      parsedResults?.ok
        ? parsedResults.value.map((result) => [
            result.name,
            result.lon,
            result.lat,
            result.distance === undefined ? '-' : result.distance,
            result.hash === undefined ? '-' : result.hash,
          ])
        : [],
    [parsedResults],
  )

  if (!parsedCommand.ok) {
    return (
      <div className="geodata-shell">
        <GeoHeader title={title} status={status} resultCount={0} />
        <Message title={errorTitle}>{parsedCommand.error}</Message>
      </div>
    )
  }

  if (parsedResults === null) {
    return null
  }

  if (!parsedResults.ok) {
    return (
      <div className="geodata-shell">
        <GeoHeader title={title} status={status} resultCount={0} />
        <Message title={errorTitle}>{parsedResults.error}</Message>
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
          <GeoPlot
            mode={mode}
            results={results}
            command={parsedCommand.value}
          />
          <GeoTable
            columns={['Member', 'Longitude', 'Latitude', 'Distance', 'Hash']}
            rows={rows}
          />
        </>
      )}
    </div>
  )
}
