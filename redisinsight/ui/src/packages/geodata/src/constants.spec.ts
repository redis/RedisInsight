import { DEFAULT_GEO_CONFIG } from './constants'

describe('DEFAULT_GEO_CONFIG', () => {
  it('contains only runtime tile configuration consumed by map components', () => {
    expect(DEFAULT_GEO_CONFIG).toEqual({
      tiles: {
        enabled: true,
        urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: 'OpenStreetMap contributors',
        maxZoom: 19,
      },
    })
  })
})
