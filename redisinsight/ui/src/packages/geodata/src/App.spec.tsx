import React from 'react'
import { render, screen } from '@testing-library/react'

import App, { GeodataMode } from './App'

const renderComponent = (
  command: string,
  response: unknown,
  mode: GeodataMode = GeodataMode.Inspector,
) =>
  render(
    <App
      command={command}
      data={[{ status: 'success', response }]}
      mode={mode}
    />,
  )

describe('Geodata App', () => {
  it('shows map guidance when WITHCOORD is missing', () => {
    renderComponent(
      'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km',
      ['Palermo'],
      GeodataMode.Markers,
    )

    expect(
      screen.getByText('Geo map visualizations require WITHCOORD in the Redis command.'),
    ).toBeInTheDocument()
  })

  it('renders Geo Inspector for GEODIST', () => {
    renderComponent('GEODIST Sicily Palermo Catania km', '166.2742')

    expect(screen.getByText('Geo Inspector')).toBeInTheDocument()
    expect(screen.getByText('166.2742 km')).toBeInTheDocument()
  })

  it('renders Geo Inspector for GEOHASH', () => {
    renderComponent('GEOHASH Sicily Palermo Catania', ['sqc8b49rny0', 'sqdtr74hyu0'])

    expect(screen.getByText('Palermo')).toBeInTheDocument()
    expect(screen.getByText('sqc8b49rny0')).toBeInTheDocument()
  })

  it('renders Geo Inspector for GEOPOS with missing members', () => {
    renderComponent('GEOPOS Sicily Palermo Missing', [['13.361389', '38.115556'], null])

    expect(screen.getByText('Palermo')).toBeInTheDocument()
    expect(screen.getByText('Missing')).toBeInTheDocument()
    expect(screen.getByText('Not found')).toBeInTheDocument()
  })

  it('renders write command summaries', () => {
    renderComponent('GEOADD Sicily 13.361389 38.115556 Palermo', 1)

    expect(screen.getByText('items added')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders stored command summaries', () => {
    renderComponent(
      'GEOSEARCHSTORE Nearby Sicily FROMLONLAT 15 37 BYRADIUS 300 km STOREDIST',
      3,
    )

    expect(screen.getByText('items stored')).toBeInTheDocument()
    expect(screen.getByText('Nearby')).toBeInTheDocument()
  })

  it('renders malicious member names as inert text', () => {
    renderComponent(
      'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHCOORD',
      [['<img src=x onerror=alert(1)>', ['15', '37']]],
      GeodataMode.Markers,
    )

    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
    expect(document.querySelector('img')).not.toBeInTheDocument()
  })

  it('does not include external map tile providers by default', () => {
    renderComponent(
      'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHCOORD',
      [['Palermo', ['13.361389', '38.115556']]],
      GeodataMode.Markers,
    )

    expect(document.body.textContent).not.toContain('tile.openstreetmap.org')
    expect(document.body.textContent).toContain('Map tiles disabled')
  })
})
