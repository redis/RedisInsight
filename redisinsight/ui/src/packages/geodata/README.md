# Geodata Workbench Plugin

Internal RedisInsight Workbench plugin for Redis GEO commands.

## Visualizations

- `Geo Map` plots coordinate-bearing search results for `GEOSEARCH`, `GEORADIUS`, and `GEORADIUSBYMEMBER`.
- `Geo Heatmap` renders the same coordinate-bearing search results as density.
- `Geo Inspector` summarizes every Redis GEO command family, including write and store commands.

The map views require `WITHCOORD` in command output. The inspector can render scalar, integer, hash, position, and search-store responses without coordinates.

`Geo Map` is the default visualization for coordinate search commands. `Geo Inspector` is the default for GEO commands that do not have coordinate rows.

## Tile Policy

The plugin loads OSM tiles by default; provider is configurable in `public/config.json`; fallback renders unavailable state.

The tile provider is declared in `public/config.json` and mirrored in the runtime default config. For an official upstream PR, maintainers may still require this to be disabled or replaced by a Redis-approved tile backend.

## Development

```sh
yarn --cwd redisinsight/ui/src/packages/geodata
yarn --cwd redisinsight/ui/src/packages/geodata test
yarn --cwd redisinsight/ui/src/packages build
```
