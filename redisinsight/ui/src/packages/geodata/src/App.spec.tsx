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
      screen.getByText(
        'Geo map visualizations require WITHCOORD in the Redis command.',
      ),
    ).toBeInTheDocument()
  })

  it('renders Geo Inspector for GEODIST', () => {
    renderComponent('GEODIST Sicily Palermo Catania km', '166.2742')

    expect(screen.getByText('Geo Inspector')).toBeInTheDocument()
    expect(screen.getByText('166.2742 km')).toBeInTheDocument()
  })

  it('renders command failures', () => {
    render(
      <App
        command="GEODIST Sicily Palermo Catania km"
        data={[{ status: 'fail', response: 'ERR failed' }]}
        mode={GeodataMode.Inspector}
      />,
    )

    expect(screen.getByText('Command failed')).toBeInTheDocument()
    expect(screen.getByText('"ERR failed"')).toBeInTheDocument()
  })

  it('renders default empty plugin state', () => {
    render(<App mode={GeodataMode.Inspector} />)

    expect(screen.getByText('No command provided')).toBeInTheDocument()
    expect(screen.getByText('unknown')).toBeInTheDocument()
    expect(screen.getByText('Missing Redis command.')).toBeInTheDocument()
  })

  it('renders Geo Inspector for GEOHASH', () => {
    renderComponent('GEOHASH Sicily Palermo Catania', [
      'sqc8b49rny0',
      'sqdtr74hyu0',
    ])

    expect(screen.getByText('Palermo')).toBeInTheDocument()
    expect(screen.getByText('sqc8b49rny0')).toBeInTheDocument()
  })

  it('renders Geo Inspector for GEOPOS with missing members', () => {
    renderComponent('GEOPOS Sicily Palermo Missing', [
      ['13.361389', '38.115556'],
      null,
    ])

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

  it('renders map rows with distance and hash columns', () => {
    renderComponent(
      'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHDIST WITHHASH WITHCOORD',
      [['Palermo', '190.4424', 3479447370796909, ['13.361389', '38.115556']]],
      GeodataMode.Markers,
    )

    expect(screen.getByRole('cell', { name: '190.4424' })).toBeInTheDocument()
    expect(
      screen.getByRole('cell', { name: '3479447370796909' }),
    ).toBeInTheDocument()
  })

  it('renders empty heatmap results without a plot', () => {
    renderComponent(
      'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHCOORD',
      [],
      GeodataMode.Heatmap,
    )

    expect(screen.getByText('Geo Heatmap')).toBeInTheDocument()
    expect(screen.getByText('No geospatial rows returned.')).toBeInTheDocument()
    expect(
      screen.queryByLabelText('Leaflet geospatial plot'),
    ).not.toBeInTheDocument()
  })

  it('renders unsupported map response errors', () => {
    renderComponent(
      'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHCOORD',
      'not-array',
      GeodataMode.Markers,
    )

    expect(screen.getByText('Cannot render map')).toBeInTheDocument()
    expect(
      screen.getByText('Geo command response must be an array.'),
    ).toBeInTheDocument()
  })

  it('renders Redis Query Engine GEO points on a map', () => {
    renderComponent(
      'FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 coords',
      [1, 'city:1', ['name', 'Paris', 'coords', '2.34,48.86']],
      GeodataMode.RqeMarkers,
    )

    expect(screen.getByText('RQE Geo Map')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Paris' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '2.34' })).toBeInTheDocument()
    expect(screen.getByText('Map tiles disabled')).toBeInTheDocument()
  })

  it('renders Redis Query Engine GEO points on a heatmap', () => {
    renderComponent(
      'FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 coords',
      [1, 'city:1', ['name', 'Paris', 'coords', '2.34,48.86']],
      GeodataMode.RqeHeatmap,
    )

    expect(screen.getByText('RQE Geo Heatmap')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Paris' })).toBeInTheDocument()
  })

  it('renders Redis Query Engine command parse errors', () => {
    renderComponent(
      'FT.SEARCH idx "*"',
      [0],
      GeodataMode.RqeInspector,
    )

    expect(screen.getByText('Cannot inspect RQE geo command')).toBeInTheDocument()
    expect(
      screen.getByText('No Redis Query Engine geospatial predicate found.'),
    ).toBeInTheDocument()
  })

  it('renders returned-field guidance for RQE GEO maps', () => {
    renderComponent(
      'FT.SEARCH idx "@coords:[2.34 48.86 1000 km]"',
      [1, 'city:1', ['name', 'Paris']],
      GeodataMode.RqeMarkers,
    )

    expect(screen.getByText('Cannot render RQE geo map')).toBeInTheDocument()
    expect(
      screen.getByText(
        'No returned geospatial fields found. Add RETURN 1 coords to the FT.SEARCH command.',
      ),
    ).toBeInTheDocument()
  })

  it('renders Redis Query Engine GEO inspector summaries', () => {
    renderComponent(
      'FT.AGGREGATE idx "@coords:[$lon $lat $radius km]" PARAMS 6 lon 2.34 lat 48.86 radius 1000 LOAD 1 @coords',
      [1, ['name', 'Paris', 'coords', '2.34,48.86']],
      GeodataMode.RqeInspector,
    )

    expect(screen.getByText('RQE Geo Inspector')).toBeInTheDocument()
    expect(screen.getByText('FT.AGGREGATE')).toBeInTheDocument()
    expect(screen.getAllByText('coords')).toHaveLength(2)
    expect(screen.getByText('1000 km')).toBeInTheDocument()
  })

  it('renders Redis Query Engine GEOSHAPE results', () => {
    renderComponent(
      'FT.SEARCH idx "@geom:[CONTAINS $shape]" PARAMS 2 shape "POINT (2 2)" RETURN 1 geom DIALECT 3',
      [1, 'shape:1', ['name', 'Zone', 'geom', 'POLYGON ((1 1, 1 3, 3 3, 1 1))']],
      GeodataMode.RqeShape,
    )

    expect(screen.getByText('RQE Geo Shape')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Zone' })).toBeInTheDocument()
    expect(screen.getByText('CONTAINS')).toBeInTheDocument()
  })

  it('renders returned-field guidance for RQE GEOSHAPE visualizations', () => {
    renderComponent(
      'FT.SEARCH idx "@geom:[CONTAINS $shape]" PARAMS 2 shape "POINT (2 2)" RETURN 1 geom DIALECT 3',
      [1, 'shape:1', ['name', 'Zone']],
      GeodataMode.RqeShape,
    )

    expect(screen.getByText('Cannot render RQE geo shape')).toBeInTheDocument()
    expect(
      screen.getByText(
        'No returned geospatial fields found. Add RETURN 1 geom to the FT.SEARCH command.',
      ),
    ).toBeInTheDocument()
  })
})
