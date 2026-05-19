# Geodata Workbench Plugin

Internal RedisInsight Workbench plugin for Redis GEO commands.

## Visualizations

- `Geospatial map` plots coordinate-bearing search results for `GEOSEARCH`, `GEORADIUS`, and `GEORADIUSBYMEMBER`.
- `Geospatial heatmap` renders the same coordinate-bearing search results as density.
- `Geospatial details` summarizes every Redis GEO command family, including write and store commands.

The map views require `WITHCOORD` in command output. The inspector can render scalar, integer, hash, position, and search-store responses without coordinates.

`Geospatial map` is the default visualization for coordinate search commands. `Geospatial details` is the default for GEO commands that do not have coordinate rows.

## Tile Policy

The plugin loads OSM tiles from the runtime default config; fallback renders unavailable state.

For an official upstream PR, maintainers may still require the default tile provider to be disabled or replaced by a Redis-approved tile backend.

## Development

```sh
yarn --cwd redisinsight/ui/src/packages/geodata
yarn --cwd redisinsight/ui/src/packages/geodata test
yarn --cwd redisinsight/ui/src/packages build
```
