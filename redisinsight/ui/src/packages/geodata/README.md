# Geodata Workbench Plugin

Internal RedisInsight Workbench plugin for Redis GEO commands.

## Visualizations

- `Geo Map` plots coordinate-bearing search results for `GEOSEARCH`, `GEORADIUS`, and `GEORADIUSBYMEMBER`.
- `Geo Heatmap` renders the same coordinate-bearing search results as density.
- `Geo Inspector` summarizes every Redis GEO command family, including write and store commands.

The map views require `WITHCOORD` in command output. The inspector can render scalar, integer, hash, position, and search-store responses without coordinates.

`Geo Map` is the default visualization for coordinate search commands. `Geo Inspector` is the default for GEO commands that do not have coordinate rows.

## Tile Policy

The plugin uses Leaflet for local rendering, but does not create an external tile layer by default. Points, search shapes, and heatmaps render without network requests to OpenStreetMap or another map provider.

If a tile provider is added later, it should be configurable and approved by maintainers before shipping.

## Development

```sh
yarn --cwd redisinsight/ui/src/packages/geodata
yarn --cwd redisinsight/ui/src/packages/geodata test
yarn --cwd redisinsight/ui/src/packages build
```
