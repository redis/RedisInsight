---
name: feature-flags
description: >-
  Create, modify, and remove feature flags in RedisInsight. Use when adding a
  new feature flag, introducing a dev flag, promoting a dev flag to regular,
  cleaning up old flags, or the user mentions feature flags, feature toggles,
  or gating features.
---

# Feature Flags

RedisInsight has its own feature flag system. Flags are defined in a remote JSON config, fetched by the backend, and served to the frontend via API. This skill covers how to add, promote, and remove flags.

## Flag Types

| Type                         | Naming                            | `flag` value | Strategy                 | Purpose                                                      |
| ---------------------------- | --------------------------------- | ------------ | ------------------------ | ------------------------------------------------------------ |
| **Dev flag**                 | `dev-<name>` (e.g. `dev-browser`) | `false`      | `CommonFlagStrategy`     | Hide incomplete features during development                  |
| **Regular flag**             | `camelCase` (e.g. `azureEntraId`) | `true`       | `CommonFlagStrategy`     | Standard on/off toggle                                       |
| **Regular with data**        | `camelCase`                       | `true`       | `WithDataFlagStrategy`   | Flag + extra config payload in `data`                        |
| **Switchable (overridable)** | `camelCase`                       | `true`       | `SwitchableFlagStrategy` | User can override locally via `~/.redis-insight/config.json` |

## Files to Change

Every new flag touches these files (in order):

### Backend (required)

1. **`redisinsight/api/config/features-config.json`**
   Add the flag entry with `flag`, `perc`, optional `filters` and `data`. Bump the `version` number.

2. **`redisinsight/api/src/modules/feature/constants/index.ts`**
   Add to the `KnownFeatures` enum.

3. **`redisinsight/api/src/modules/feature/constants/known-features.ts`**
   Add entry to the `knownFeatures` record with `name` and `storage` (usually `FeatureStorage.Database`).

4. **`redisinsight/api/src/modules/feature/providers/feature-flag/feature-flag.provider.ts`**
   Register the flag with its strategy (see Strategy Types below).

### Frontend (required if the flag gates UI)

5. **`redisinsight/ui/src/constants/featureFlags.ts`**
   Add to the `FeatureFlags` enum.

6. **`redisinsight/ui/src/slices/app/features.ts`**
   Add default state entry in `initialState.featureFlags.features` with `{ flag: false }`.

### Consuming code

7. Use the flag in components/hooks to gate functionality.

## Strategy Selection

Choose the strategy based on what the flag needs:

```
CommonFlagStrategy        → Most flags (dev and regular on/off)
WithDataFlagStrategy      → Flag needs to carry extra data payload
SwitchableFlagStrategy    → Flag should be overridable via local config.json
```

Register in `feature-flag.provider.ts`:

```typescript
this.strategies.set(
  KnownFeatures.YourFeature,
  new CommonFlagStrategy(this.featuresConfigService, this.settingsService),
);
```

## Config JSON Structure

### Minimal (dev flag)

```json
"dev-myFeature": {
  "flag": false,
  "perc": [[0, 100]]
}
```

### With filters (Electron-only)

```json
"myFeature": {
  "flag": true,
  "perc": [[0, 100]],
  "filters": [
    { "name": "config.server.buildType", "value": "ELECTRON", "cond": "eq" }
  ]
}
```

### Gradual rollout (10% of users)

```json
"myFeature": {
  "flag": true,
  "perc": [[0, 10]]
}
```

### With data payload

```json
"myFeature": {
  "flag": true,
  "perc": [[0, 100]],
  "data": { "strategy": "ioredis" }
}
```

## Filter Conditions

Filters compare a value from server state against the filter value.

| Condition    | Meaning                         |
| ------------ | ------------------------------- |
| `eq`         | equals                          |
| `neq`        | not equals                      |
| `gt` / `gte` | greater than / greater or equal |
| `lt` / `lte` | less than / less or equal       |

Common `name` paths: `config.server.buildType` (ELECTRON, DOCKER_ON_PREMISE, REDIS_STACK), `config.server.packageVersion` (uses semver), `agreements.analytics`, `env.<VAR_NAME>`.

Filters support `and`/`or` composition for complex conditions.

## Workflows

### Add a dev feature flag

Use for features under active development that should not be visible in production.

1. `features-config.json` → add `"dev-myFeature": { "flag": false, "perc": [[0, 100]] }`
2. `constants/index.ts` → add `DevMyFeature = 'dev-myFeature'` to `KnownFeatures`
3. `constants/known-features.ts` → add record entry
4. `feature-flag.provider.ts` → register with `CommonFlagStrategy`
5. `ui/src/constants/featureFlags.ts` → add `devMyFeature = 'dev-myFeature'`
6. `ui/src/slices/app/features.ts` → add default `{ flag: false }`

### Promote dev flag to regular flag

When the feature is complete and ready for rollout.

1. Rename `dev-myFeature` → `myFeature` in all the files above
2. Set `flag: true` in `features-config.json`
3. Optionally set `perc` for gradual rollout (e.g. `[[0, 10]]`)
4. Change strategy if needed (e.g. to `SwitchableFlagStrategy` for overridable)
5. Bump config `version`

### Clean up a flag

When a feature is fully rolled out and the flag is no longer needed.

1. Remove from `features-config.json`
2. Remove from `KnownFeatures` enum
3. Remove from `knownFeatures` record
4. Remove strategy registration from `feature-flag.provider.ts`
5. Remove from FE `FeatureFlags` enum
6. Remove default state from `features.ts`
7. Remove all gating code (conditionals, `FeatureFlagComponent` wrappers) in consuming components

## FE Usage Patterns

### Check flag in a component

```typescript
import { FeatureFlags } from 'uiSrc/constants';
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features';

const features = useSelector(appFeatureFlagsFeaturesSelector);
const isEnabled = features[FeatureFlags.myFeature]?.flag;
```

### Custom selector for complex logic

```typescript
export const isMyFeatureEnabledSelector = (state: RootState): boolean => {
  const features = state.app.features.featureFlags.features;
  return features[FeatureFlags.myFeature]?.flag ?? false;
};
```
