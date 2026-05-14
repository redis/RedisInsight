import React from 'react'

import { GeoHeader } from './GeoHeader'
import { GeoTable } from './GeoTable'
import { Message } from './Message'
import {
  getSearchMemberRows,
  parseGeoCommand,
  parseGeoDistanceResult,
  parseGeoHashResults,
  parseGeoPositionResults,
  parseGeoSearchResults,
  parseIntegerResult,
} from '../utils/geoParser'
import { ParsedGeoCommand } from '../types'

interface GeoInspectorProps {
  command: string
  response: unknown
  status: string
}

const getDestination = (command: ParsedGeoCommand): string =>
  command.destinationKey || command.storeKey || command.storeDistKey || '-'

const renderCommandSummary = (command: ParsedGeoCommand) => (
  <dl className="geodata-summary-grid" aria-label="Command summary">
    <div>
      <dt>Command</dt>
      <dd>{command.command}</dd>
    </div>
    <div>
      <dt>Source key</dt>
      <dd>{command.key || '-'}</dd>
    </div>
    <div>
      <dt>Destination</dt>
      <dd>{getDestination(command)}</dd>
    </div>
    <div>
      <dt>Shape</dt>
      <dd>{command.searchType}</dd>
    </div>
  </dl>
)

const renderSearchRows = (response: unknown, command: ParsedGeoCommand) => {
  if (command.withCoord) {
    const parsedResults = parseGeoSearchResults(response, command)
    if (!parsedResults.ok) {
      return <Message title="Unsupported response">{parsedResults.error}</Message>
    }

    return (
      <GeoTable
        columns={['Member', 'Longitude', 'Latitude', 'Distance', 'Hash']}
        rows={parsedResults.value.map((result) => [
          result.name,
          result.lon,
          result.lat,
          result.distance === undefined ? '-' : result.distance,
          result.hash === undefined ? '-' : result.hash,
        ])}
      />
    )
  }

  const members = getSearchMemberRows(response)
  return (
    <GeoTable
      columns={['Member']}
      rows={members.map((member) => [member])}
    />
  )
}

const renderInspectorBody = (response: unknown, command: ParsedGeoCommand) => {
  if (command.kind === 'distance') {
    const parsedResult = parseGeoDistanceResult(response, command)
    if (!parsedResult.ok) {
      return <Message title="Unsupported response">{parsedResult.error}</Message>
    }

    const { distance, unit } = parsedResult.value
    return (
      <section className="geodata-metric">
        <span>Distance</span>
        <strong>{distance === null ? 'Not found' : `${distance} ${unit}`}</strong>
      </section>
    )
  }

  if (command.kind === 'hashList') {
    const parsedResult = parseGeoHashResults(response, command)
    if (!parsedResult.ok) {
      return <Message title="Unsupported response">{parsedResult.error}</Message>
    }

    return (
      <GeoTable
        columns={['Member', 'Geohash']}
        rows={parsedResult.value.map(({ member, hash }) => [member, hash || 'Not found'])}
      />
    )
  }

  if (command.kind === 'pointList') {
    const parsedResult = parseGeoPositionResults(response, command)
    if (!parsedResult.ok) {
      return <Message title="Unsupported response">{parsedResult.error}</Message>
    }

    return (
      <GeoTable
        columns={['Member', 'Longitude', 'Latitude', 'Status']}
        rows={parsedResult.value.map((result) => [
          result.member,
          result.lon === undefined ? '-' : result.lon,
          result.lat === undefined ? '-' : result.lat,
          result.missing ? 'Not found' : 'Found',
        ])}
      />
    )
  }

  if (command.kind === 'addSummary' || command.kind === 'storeSummary') {
    const parsedResult = parseIntegerResult(response, command)
    if (!parsedResult.ok) {
      return <Message title="Unsupported response">{parsedResult.error}</Message>
    }

    return (
      <section className="geodata-metric">
        <span>{parsedResult.value.label}</span>
        <strong>{parsedResult.value.count}</strong>
      </section>
    )
  }

  return renderSearchRows(response, command)
}

export const GeoInspector = ({ command, response, status }: GeoInspectorProps) => {
  const parsedCommand = parseGeoCommand(command)

  if (!parsedCommand.ok) {
    return (
      <div className="geodata-shell">
        <GeoHeader title="Geo Inspector" command={command} status={status} />
        <Message title="Cannot inspect command">{parsedCommand.error}</Message>
      </div>
    )
  }

  return (
    <div className="geodata-shell">
      <GeoHeader title="Geo Inspector" command={command} status={status} />
      {renderCommandSummary(parsedCommand.value)}
      {renderInspectorBody(response, parsedCommand.value)}
    </div>
  )
}
