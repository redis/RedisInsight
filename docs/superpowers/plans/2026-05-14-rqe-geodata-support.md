# Redis Query Engine Geodata Support Plan

## Goal

Extend the internal RedisInsight `geodata` Workbench plugin so it can visualize Redis Query Engine geospatial results from `FT.SEARCH`, `FT.AGGREGATE`, and `FT.HYBRID`, while preserving the existing native Redis GEO visualizations.

## Scope

- Keep one bundled internal plugin under `redisinsight/ui/src/packages/geodata`.
- Keep native GEO visualization IDs stable:
  - `ri-demo-geodata-markers`
  - `ri-demo-geodata-heatmap`
  - `ri-geodata-inspector`
- Add opt-in RQE visualization IDs:
  - `ri-geodata-rqe-map`
  - `ri-geodata-rqe-heatmap`
  - `ri-geodata-rqe-inspector`
  - `ri-geodata-rqe-shape`
- Do not fetch missing documents or coordinates from Redis.
- Keep external map tiles disabled by default.

## Implementation Steps

1. Preserve current geodata coverage work in a local commit before starting RQE changes.
2. Add optional plugin query matching with `matchQuery.anyRegex`.
3. Update Workbench plugin matching so command matching runs first, then optional full-query regex matching.
4. Treat invalid visualization regexes as non-matching instead of crashing Workbench.
5. Add RQE command parsing for `FT.SEARCH`, `FT.AGGREGATE`, and `FT.HYBRID`.
6. Detect GEO radius syntax, legacy `GEOFILTER`, and GEOSHAPE predicates.
7. Substitute `PARAMS` references in numeric GEO filters and WKT shapes.
8. Normalize RQE replies into shared point, shape, and overlay types.
9. Render RQE point results through the existing map, heatmap, and table shell.
10. Add shape rendering for WKT `POINT` and `POLYGON`, including polygon holes.
11. Add RQE manifest entries with `default: false` so existing RediSearch views remain default.
12. Add tests for matching, parser coverage, response normalization, UI guidance, and shape rendering.

## Acceptance Criteria

- Plain `FT.SEARCH idx "*"` does not show geodata visualizations.
- RQE commands with GEO radius, `GEOFILTER`, or GEOSHAPE predicates show the new opt-in geodata visualizations.
- Native `GEOSEARCH ... WITHCOORD` behavior remains unchanged.
- Missing returned GEO fields show exact `RETURN` or `LOAD` guidance.
- GEOSHAPE visualizations draw returned WKT only; query shapes are context overlays.
- No unsafe HTML interpolation is used for labels or popups.
- Geodata package test coverage stays at or above 90% for statements, branches, functions, and lines.

## Verification

Run from the repository root:

```sh
/opt/homebrew/bin/rtk npx yarn@1.22.22 --cwd redisinsight/ui/src/packages/geodata test --coverage --coverageReporters=text
/opt/homebrew/bin/rtk npx jest redisinsight/ui/src/utils/tests/plugins.spec.ts --runInBand
/opt/homebrew/bin/rtk npx yarn@1.22.22 type-check:ui
/opt/homebrew/bin/rtk npx yarn@1.22.22 lint:ui
/opt/homebrew/bin/rtk npx yarn@1.22.22 build:statics
```

## Manual Checks

- `GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHCOORD` still renders native map and heatmap.
- `FT.SEARCH idx "*"` does not show geodata options.
- `FT.SEARCH idx "@coords:[2.34 48.86 1000 km]" RETURN 1 coords` renders RQE map and heatmap.
- `FT.AGGREGATE idx "@coords:[2.34 48.86 1000 km]" LOAD 1 @coords` renders RQE map.
- `FT.SEARCH idx "@geom:[WITHIN $shape]" PARAMS 2 shape "POLYGON ((1 1, 1 3, 3 3, 1 1))" RETURN 1 geom DIALECT 3` renders RQE shape visualization.
- Missing returned geospatial fields show guidance instead of an empty map.

## Deferred

- `MULTIPOLYGON` and other WKT geometries.
- Fetching missing coordinates or shapes from Redis documents.
- Enabling external tile providers by default.
- Making RQE geodata the default visualization for FT commands.
