import React from 'react'

import { GeoHeader } from '../GeoHeader'
import { GeoMetric } from '../GeoMetric'
import { GeoSummary } from '../GeoSummary'
import { GeoTable } from '../GeoTable'
import { Message } from '../Message'
import { Shell } from '../Shell'
import {
  getSearchMemberRows,
  parseGeoCommand,
  parseGeoDistanceResult,
  parseGeoHashResults,
  parseGeoPositionResults,
  parseGeoSearchResults,
  parseIntegerResult,
} from '../../utils/geoParser'
import { ParsedGeoCommand } from '../../types'

interface GeoInspectorProps {
  command: string
  response: unknown
  status: string
}

const getDestination = (command: ParsedGeoCommand): string =>
  command.destinationKey || command.storeKey || command.storeDistKey || '-'

const renderCommandSummary = (command: ParsedGeoCommand) => (
  <GeoSummary
    ariaLabel="Command summary"
    items={[
      { label: 'Command', value: command.command },
      { label: 'Source key', value: command.key || '-' },
      { label: 'Destination', value: getDestination(command) },
      { label: 'Shape', value: command.searchType },
    ]}
  />
)

const renderSearchRows = (response: unknown, command: ParsedGeoCommand) => {
  if (command.withCoord) {
    const parsedResults = parseGeoSearchResults(response, command)
    if (!parsedResults.ok) {
      return (
        <Message title="Unsupported response" variant="danger">
          {parsedResults.error}
        </Message>
      )
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
      return (
        <Message title="Unsupported response" variant="danger">
          {parsedResult.error}
        </Message>
      )
    }

    const { distance, unit } = parsedResult.value
    return (
      <GeoMetric
        label="Distance"
        value={distance === null ? 'Not found' : `${distance} ${unit}`}
      />
    )
  }

  if (command.kind === 'hashList') {
    const parsedResult = parseGeoHashResults(response, command)
    if (!parsedResult.ok) {
      return (
        <Message title="Unsupported response" variant="danger">
          {parsedResult.error}
        </Message>
      )
    }

    return (
      <GeoTable
        columns={['Member', 'Geohash']}
        rows={parsedResult.value.map(({ member, hash }) => [
          member,
          hash || 'Not found',
        ])}
      />
    )
  }

  if (command.kind === 'pointList') {
    const parsedResult = parseGeoPositionResults(response, command)
    if (!parsedResult.ok) {
      return (
        <Message title="Unsupported response" variant="danger">
          {parsedResult.error}
        </Message>
      )
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
      return (
        <Message title="Unsupported response" variant="danger">
          {parsedResult.error}
        </Message>
      )
    }

    return (
      <GeoMetric
        label={parsedResult.value.label}
        value={parsedResult.value.count}
      />
    )
  }

  return renderSearchRows(response, command)
}

export const GeoInspector = ({
  command,
  response,
  status,
}: GeoInspectorProps) => {
  const parsedCommand = parseGeoCommand(command)
  const title = 'Geospatial details'

  if (!parsedCommand.ok) {
    return (
      <Shell>
        <GeoHeader title={title} status={status} />
        <Message title="Cannot inspect command" variant="danger">
          {parsedCommand.error}
        </Message>
      </Shell>
    )
  }

  return (
    <Shell>
      <GeoHeader title={title} status={status} />
      {renderCommandSummary(parsedCommand.value)}
      {renderInspectorBody(response, parsedCommand.value)}
    </Shell>
  )
}
