import React from 'react'
import { render, screen } from '@testing-library/react'

import { GeoInspector } from './GeoInspector'

const renderInspector = (
  command: string,
  response: unknown,
  status = 'success',
) =>
  render(<GeoInspector command={command} response={response} status={status} />)

describe('GeoInspector', () => {
  it('renders parse errors for unsupported commands', () => {
    renderInspector('PING', 'PONG')

    expect(screen.getByText('Geo Inspector')).toBeInTheDocument()
    expect(screen.getByText('Cannot inspect command')).toBeInTheDocument()
    expect(
      screen.getByText('Unsupported geo command: PING.'),
    ).toBeInTheDocument()
  })

  it('renders search member rows when WITHCOORD is absent', () => {
    renderInspector('GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km', [
      'Palermo',
      'Catania',
    ])

    expect(
      screen.getByRole('columnheader', { name: 'Member' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Palermo' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Catania' })).toBeInTheDocument()
  })

  it('renders unsupported search response messages', () => {
    renderInspector(
      'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHCOORD',
      'bad',
    )

    expect(screen.getByText('Unsupported response')).toBeInTheDocument()
    expect(
      screen.getByText('Geo command response must be an array.'),
    ).toBeInTheDocument()
  })

  it('renders coordinate search rows with distance and hash values', () => {
    renderInspector(
      'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHDIST WITHHASH WITHCOORD',
      [['Palermo', '190.4424', 3479447370796909, ['13.361389', '38.115556']]],
    )

    expect(
      screen.getByRole('columnheader', { name: 'Longitude' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Palermo' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '190.4424' })).toBeInTheDocument()
    expect(
      screen.getByRole('cell', { name: '3479447370796909' }),
    ).toBeInTheDocument()
  })

  it('renders missing distance results', () => {
    renderInspector('GEODIST Sicily Palermo Missing km', null)

    expect(screen.getByText('Distance')).toBeInTheDocument()
    expect(screen.getByText('Not found')).toBeInTheDocument()
  })

  it('renders unsupported distance responses', () => {
    renderInspector('GEODIST Sicily Palermo Catania km', 'bad')

    expect(screen.getByText('Unsupported response')).toBeInTheDocument()
    expect(
      screen.getByText('GEODIST response must be numeric or null.'),
    ).toBeInTheDocument()
  })

  it('renders missing geohash rows', () => {
    renderInspector('GEOHASH Sicily Palermo Missing', ['sqc8b49rny0', null])

    expect(screen.getByRole('cell', { name: 'Palermo' })).toBeInTheDocument()
    expect(
      screen.getByRole('cell', { name: 'sqc8b49rny0' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Missing' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Not found' })).toBeInTheDocument()
  })

  it('renders unsupported geohash responses', () => {
    renderInspector('GEOHASH Sicily Palermo', 'bad')

    expect(screen.getByText('Unsupported response')).toBeInTheDocument()
    expect(
      screen.getByText('GEOHASH response must be an array.'),
    ).toBeInTheDocument()
  })

  it('renders unsupported geopos responses', () => {
    renderInspector('GEOPOS Sicily Palermo', 'bad')

    expect(screen.getByText('Unsupported response')).toBeInTheDocument()
    expect(
      screen.getByText('GEOPOS response must be an array.'),
    ).toBeInTheDocument()
  })

  it('renders unsupported integer responses for write summaries', () => {
    renderInspector('GEOADD Sicily 13.361389 38.115556 Palermo', 'bad')

    expect(screen.getByText('Unsupported response')).toBeInTheDocument()
    expect(
      screen.getByText('GEOADD response must be an integer.'),
    ).toBeInTheDocument()
  })

  it('renders unsupported integer responses for store summaries', () => {
    renderInspector(
      'GEOSEARCHSTORE Nearby Sicily FROMLONLAT 15 37 BYRADIUS 300 km',
      'bad',
    )

    expect(screen.getByText('Unsupported response')).toBeInTheDocument()
    expect(
      screen.getByText('GEOSEARCHSTORE response must be an integer.'),
    ).toBeInTheDocument()
  })
})
