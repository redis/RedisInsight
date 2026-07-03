# RedisInsight environment variables

Reference for every RedisInsight-owned environment variable: what it does, its default, and
an example value. RedisInsight is configured almost entirely through environment variables;
this is the single place that documents them.

- **Source of truth** for defaults: [`redisinsight/api/config/default.ts`](../redisinsight/api/config/default.ts) (backend) and [`redisinsight/ui/src/config/default.ts`](../redisinsight/ui/src/config/default.ts) (frontend). If a value here ever disagrees with those files, the files win — please fix the doc.
- Copy-paste templates live next to each app that loads a `.env`: `redisinsight/api/.env.example`, `redisinsight/ui/.env.example`, and `tests/e2e-playwright/example.env`. The desktop app has no `.env` loader (see below) — set its variables in the environment.

## Contents

- [How configuration is loaded](#how-configuration-is-loaded)
- [Server & network](#server--network)
- [Storage & paths](#storage--paths)
- [Security & encryption](#security--encryption)
- [Redis client tuning](#redis-client-tuning)
- [Scanning & data limits](#scanning--data-limits)
- [Cloud & OAuth / IDP](#cloud--oauth--idp)
- [AI (Copilot / ConvAI)](#ai-copilot--convai)
- [Analytics, telemetry & error reporting](#analytics-telemetry--error-reporting)
- [Logging](#logging)
- [Features, tutorials & static content](#features-tutorials--static-content)
- [Notifications](#notifications)
- [Sockets](#sockets)
- [UI-only / build-time](#ui-only--build-time)
- [Desktop / Electron](#desktop--electron)
- [Pre-setup databases (auto-add on startup)](#pre-setup-databases-auto-add-on-startup)
- [Build & CI](#build--ci)
- [E2E tests](#e2e-tests)
- [Appendix: variables set by tooling, not RedisInsight](#appendix-variables-set-by-tooling-not-redisinsight)

## How configuration is loaded

RedisInsight is a monorepo of separate apps, each with its own `.env` file loaded from its
own directory:

| App | Env file | Loaded by |
|-----|----------|-----------|
| API (backend) | `redisinsight/api/.env` | `import 'dotenv/config'` in [`api/src/main.ts`](../redisinsight/api/src/main.ts) |
| UI (frontend) | `redisinsight/ui/.env` | `dotenv/config` + Vite (`envPrefix: 'RI_'`) in [`ui/vite.config.mjs`](../redisinsight/ui/vite.config.mjs) |
| Desktop (Electron) | _(none)_ | Read directly from the process environment — no dotenv/`.env` loader. Dev scripts inject them via `cross-env` (see root `package.json`); packaged builds inherit the launching environment. |
| E2E tests | `tests/e2e-playwright/.env` (+ `.env.{ENV}`) | [`tests/e2e-playwright/config/env.ts`](../tests/e2e-playwright/config/env.ts) |

Key points:

- **Only `RI_*` variables reach the browser.** Vite is configured with `envPrefix: 'RI_'`, so
  UI code can only read variables that start with `RI_`. These are **inlined at build time** —
  changing them requires a rebuild, not just a restart.
- **The backend reads env at runtime**, then merges config by `NODE_ENV`
  (`development` / `production` / `staging` / `test`) and by `RI_BUILD_TYPE`. Env-specific
  files ([`production.ts`](../redisinsight/api/config/production.ts),
  [`staging.ts`](../redisinsight/api/config/staging.ts), etc.) override the defaults below —
  differences are noted per variable where they matter.
- **`Scope` column** below indicates which app(s) read the variable: `api`, `ui`, `desktop`,
  `e2e`, `build`.

> **Secrets:** variables holding tokens, keys, or passwords are marked 🔑. Never commit real
> values — the `.env.example` files use placeholders only.

---

## Server & network

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_APP_PORT` | api, ui, desktop | `5540` | HTTP port the API server listens on (and the port the UI/desktop target). |
| `RI_APP_HOST` | api | `0.0.0.0` | Network interface the API binds to. |
| `RI_BASE` | api | `/` | Base path the app is served under (for reverse-proxy sub-path hosting). |
| `RI_PROXY_PATH` | api | `` (empty) | Extra path prefix applied to static/plugin/socket URLs when behind a proxy. |
| `RI_SOCKET_PROXY_PATH` | api | `` (empty) | Path prefix for the Socket.IO endpoint when behind a proxy. |
| `RI_EXTERNAL_URL` | api | _(unset)_ | External URL used for OAuth callbacks when running behind a proxy or on a custom port. See [azure-docker-setup.md](./azure-docker-setup.md). |
| `RI_API_PREFIX` | ui | `api` | Path prefix under which the API is mounted (used to build request URLs). |
| `RI_BASE_API_URL` | ui | `http://localhost` (or `https://` if TLS certs set) | Base URL the UI uses to reach the API. |
| `RI_REQUEST_TIMEOUT` | api | `25000` (ms) | Timeout for incoming HTTP requests. |
| `RI_MAX_PAYLOAD_SIZE` | api | `512MB` | Maximum accepted request body size. |
| `RI_CORS_ORIGIN` | api | `*` | Allowed CORS origin(s) for the HTTP API. |
| `RI_CORS_CREDENTIALS` | api | `false` | Whether the HTTP API allows credentialed CORS requests. |
| `RI_DATABASE_MANAGEMENT` | api | `true` | When `false`, disables adding/editing/deleting database connections. |
| `RI_ACCEPT_TERMS_AND_CONDITIONS` | api | `false` | Auto-accept EULA/telemetry agreements (headless/automated deployments). |
| `RI_AUTO_BOOTSTRAP` | api | `true` | Run bootstrap (migrations, defaults) automatically on startup. |
| `RI_MIGRATE_OLD_FOLDERS` | api | `true` | Migrate data from older RedisInsight home folders on startup. |
| `RI_SERVE_STATICS` | api | `true` | Serve the bundled UI/static content from the API server. |
| `RI_BUILD_TYPE` | api, build | `DOCKER_ON_PREMISE` | Build/runtime flavour: `ELECTRON`, `DOCKER_ON_PREMISE`, `REDIS_STACK`. Affects paths and enabled features. |
| `RI_APP_TYPE` | api, ui, desktop | _(unset)_ | Distribution type identifier (e.g. `ELECTRON`); influences UI behaviour. |
| `RI_APP_VERSION` | api | `3.6.0` | Overrides the reported app version. |
| `RI_APP_BUILD_COMMIT_SHA` | api, build | _(git HEAD)_ | Commit SHA reported in build info; falls back to `git rev-parse` at runtime. |

## Storage & paths

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_APP_FOLDER_NAME` | api | `.redis-insight` (`.redis-insight-stage` on staging) | Name of the home folder created under the user's home dir (production/staging config). |
| `RI_APP_FOLDER_ABSOLUTE_PATH` | api | _(unset)_ | Absolute path for the home folder; overrides `RI_APP_FOLDER_NAME`. |
| `RI_DATA_DIR` | api | _(home)/data_ (`.test_run/data` in tests) | Directory for the app's working data. |
| `RI_DEFAULTS_DIR` | api | _(bundled defaults)_ | Directory holding bundled default content (commands, tutorials, content). |
| `RI_PRE_SETUP_DATABASES_PATH` | api | `<home>/databases.json` | Path to a JSON file of databases to pre-add on startup. |
| `RI_TUTORIALS_PATH` | api | `<home>/tutorials` | Tutorials directory. Setting it also enables tutorials "dev mode". |
| `RI_CONTENT_PATH` | api | `<home>/content` | Static content directory. Setting it also enables content "dev mode". |
| `RI_GUIDES_PATH` | api | `<home>/guides` | Legacy guides directory (listed among old folders to migrate). |
| `RI_AGREEMENTS_PATH` | api | _(unset)_ | Path to a custom agreements/EULA file. |

## Security & encryption

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_ENCRYPTION_KEY` 🔑 | api | _(unset)_ | AES key used to encrypt stored secrets (passwords, tokens) when keytar is not used. |
| `RI_ENCRYPTION_IV` 🔑 | api | 16 zero bytes | Initialization vector for encryption. |
| `RI_ENCRYPTION_ALGORYTHM` | api | `aes-256-cbc` | Encryption algorithm (note: env name keeps the original spelling). |
| `RI_ENCRYPTION_KEYTAR` | api | `true` | Use the OS keychain (keytar) for secret storage when available. |
| `RI_ENCRYPTION_KEYTAR_SERVICE` | api | `redisinsight` | Keytar service name. **Do not change for RedisInsight** — only overridden by the VS Code extension. |
| `RI_SECRET_STORAGE_PASSWORD` 🔑 | api | _(unset)_ | Password protecting the secret storage. |
| `RI_SERVER_TLS_CERT` 🔑 | api, ui | _(unset)_ | TLS certificate (PEM) to serve the API over HTTPS. If both cert and key are set, the UI defaults to `https://localhost`. |
| `RI_SERVER_TLS_KEY` 🔑 | api, ui | _(unset)_ | TLS private key (PEM) for HTTPS. |

## Redis client tuning

Timeouts are in milliseconds unless noted.

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_REDIS_CLIENTS_FORCE_STRATEGY` | api | _(unset)_ | Force a specific client connection strategy. |
| `RI_REDIS_CLIENTS_IDLE_THRESHOLD` | api | `3600000` (1h) | How long a client may be idle before it's considered stale. |
| `RI_REDIS_CLIENTS_SYNC_INTERVAL` | api | `60000` (1m) | Interval for syncing active clients. |
| `RI_CLIENTS_IDLE_SYNC_INTERVAL` | api | `3600000` (1h) | Interval for syncing idle clients. |
| `RI_CLIENTS_MAX_IDLE_THRESHOLD` | api | `3600000` (1h) | Maximum idle time before a client is closed. |
| `RI_CLIENTS_RETRY_TIMES` | api | `3` | Connection retry attempts. |
| `RI_CLIENTS_RETRY_DELAY` | api | `500` | Delay between retries. |
| `RI_CLIENTS_MAX_RETRIES_PER_REQUEST` | api | `1` | Max retries per individual request. |
| `RI_CLIENTS_MAX_REDIRECTIONS` | api | `3` | Max cluster redirections (MOVED/ASK) to follow. |
| `RI_CLIENTS_SLOTS_REQUEST_TIMEOUT` | api | `5000` | Timeout for cluster slots refresh requests. |
| `RI_CLIENTS_MAX_STRING_SIZE` | api | _(unset)_ | Max string length returned before truncation (bytes). |
| `RI_CLIENTS_TRUNCATED_STRING_PREFIX` | api, ui | `[Truncated due to length]` | Prefix shown on truncated string values. |
| `RI_CONNECTIONS_TIMEOUT_DEFAULT` | api, ui | `30000` | Default connection timeout. |
| `RI_TIMEOUT_TO_GET_INFO` | ui | `5000` | UI timeout for fetching database INFO. |
| `RI_TIMEOUT_TO_GET_RECOMMENDATIONS` | ui | `60000` | UI timeout for fetching recommendations. |

## Scanning & data limits

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_SCAN_COUNT_DEFAULT` | api, ui | api `200`, ui `500` | Default `COUNT` for SCAN operations. |
| `RI_SCAN_TREE_COUNT_DEFAULT` | ui | `10000` | Default number of keys scanned for the tree view. |
| `RI_SCAN_THRESHOLD` | api | `10000` | Soft cap on total keys scanned. |
| `RI_SCAN_THRESHOLD_MAX` | api | `Number.MAX_VALUE` | Hard cap on total keys scanned. |
| `RI_JSON_SIZE_THRESHOLD` | api | `1024` | Byte threshold above which JSON values are fetched lazily. |
| `RI_JSON_LENGTH_THRESHOLD` | api | `-1` (disabled) | Length threshold for JSON handling. |
| `RI_COMMAND_EXECUTION_MAX_RESULT_SIZE` | api, ui | `1048576` (1MB) | Max size of a stored Workbench command result. |
| `RI_COMMAND_EXECUTION_MAX_ITEMS_PER_DB` | api | `30` | Max Workbench command-history items kept per database. |
| `RI_WORKBENCH_BATCH_SIZE` | api | `5` | Pipeline batch size for Workbench execution. |
| `PIPELINE_COUNT_DEFAULT` | ui | `5` | Default Workbench pipeline count. |
| `RI_WORKBENCH_UNSUPPORTED_COMMANDS` | api | `[]` | JSON array of commands disabled in Workbench. |
| `RI_CLI_UNSUPPORTED_COMMANDS` | api | `[]` | JSON array of commands disabled in the CLI. |
| `RI_DATABASE_ANALYSIS_MAX_ITEMS_PER_DB` | api | `5` | Max stored database-analysis reports per database. |
| `RI_BROWSER_HISTORY_MAX_ITEMS_PER_MODE_IN_DB` | api | `10` | Max browser-history entries per view mode per database. |
| `RI_PLUGIN_STATE_MAX_SIZE` | api | `1048576` (1MB) | Max size of persisted plugin state. |
| `RI_REJSON_MONACO_EDITOR_MAX_THRESHOLD` | ui | `10000` | Max ReJSON size (chars) editable in the Monaco editor. |
| `RI_DATABASE_OVERVIEW_REFRESH_INTERVAL` | ui | `5` (s) | Database overview auto-refresh interval. |
| `RI_DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL` | ui | `1` (s) | Minimum allowed overview refresh interval. |
| `RI_PROFILER_LOG_FILE_IDLE_THRESHOLD` | api | `60000` (1m) | Idle time before a profiler log file is closed. |

## Cloud & OAuth / IDP

Redis Cloud integration and OAuth. Per-provider variables (`..._GOOGLE_...`, `..._GH_...`,
`..._SSO_...`) fall back to the generic `RI_CLOUD_IDP_*` value when unset.

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_CLOUD_API_URL` | api | QA URL (prod: N/A) | Redis Cloud API base URL. |
| `RI_CLOUD_API_TOKEN` 🔑 | api | `token` | Redis Cloud API token. |
| `RI_CLOUD_CAPI_URL` | api | QA URL (prod: `https://api.redislabs.com/v1`) | Redis Cloud programmatic API (CAPI) URL. |
| `RI_CLOUD_CAPI_KEY_NAME` | api | `RedisInsight` | Name assigned to generated CAPI keys. |
| `RI_CLOUD_FREE_SUBSCRIPTION_NAME` | api | `My free subscription` | Default name for a created free subscription. |
| `RI_CLOUD_FREE_DATABASE_NAME` | api | `Redis-Cloud` | Default name for a created free database. |
| `RI_CLOUD_DEFAULT_PLAN_REGION` | api | `eu-west-1` | Default region for free plan provisioning. |
| `RI_CLOUD_JOB_ITERATION_INTERVAL` | api | `10000` | Polling interval for long-running cloud jobs. |
| `RI_CLOUD_DISCOVERY_TIMEOUT` | api | `60000` | Timeout for cloud database discovery. |
| `RI_CLOUD_DATABASE_CONNECTION_TIMEOUT` | api | `30000` | Timeout connecting to a cloud database. |
| `RI_CLOUD_IDP_AUTHORIZE_URL` | api | _(unset)_ | Generic OAuth authorize URL (fallback for all providers). |
| `RI_CLOUD_IDP_TOKEN_URL` | api | _(unset)_ | Generic OAuth token URL. |
| `RI_CLOUD_IDP_REVOKE_TOKEN_URL` | api | _(unset)_ | Generic OAuth token-revocation URL. |
| `RI_CLOUD_IDP_ISSUER` | api | _(unset)_ | Generic OAuth issuer. |
| `RI_CLOUD_IDP_CLIENT_ID` | api | _(unset)_ | Generic OAuth client ID. |
| `RI_CLOUD_IDP_REDIRECT_URI` | api | _(unset)_ | Generic OAuth redirect URI. |
| `RI_CLOUD_IDP_GOOGLE_*` | api | fall back to generic | Google-specific `AUTHORIZE_URL`, `TOKEN_URL`, `REVOKE_TOKEN_URL`, `ISSUER`, `CLIENT_ID`, `REDIRECT_URI`, plus `RI_CLOUD_IDP_GOOGLE_ID`. |
| `RI_CLOUD_IDP_GH_*` | api | fall back to generic | GitHub-specific equivalents, plus `RI_CLOUD_IDP_GH_ID`. |
| `RI_CLOUD_IDP_SSO_*` | api | fall back to generic | SSO/SAML equivalents, plus `RI_CLOUD_IDP_SSO_ID` and `RI_CLOUD_IDP_SSO_EMAIL_VERIFICATION_URI` (default `saml/okta_idp_id`). |

## AI (Copilot / ConvAI)

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_AI_CONVAI_API_URL` | api | staging URL (prod: `https://redis.io/convai/api`) | Conversational AI (docs assistant) API URL. |
| `RI_AI_CONVAI_TOKEN` 🔑 | api | _(unset)_ | Conversational AI API token. |
| `RI_AI_QUERY_SOCKET_URL` | api | QA URL (prod: `https://app.redislabs.com`) | Query Copilot Socket.IO server URL. |
| `RI_AI_QUERY_SOCKET_PATH` | api | `/api/v1/cloud-copilot-service/socket.io/` | Query Copilot Socket.IO path. |
| `RI_AI_QUERY_HISTORY_LIMIT` | api | `20` | Max stored Copilot query-history items. |
| `RI_AI_QUERY_MAX_RESULTS` | api | `50` | Max results sent to the query assistant. |
| `RI_AI_QUERY_MAX_NESTED_ELEMENTS` | api | `25` | Max nested elements included in query context. |

## Analytics, telemetry & error reporting

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_SEGMENT_WRITE_KEY` 🔑 | api | `SOURCE_WRITE_KEY` (prod/staging: real keys) | Segment analytics write key. |
| `RI_ANALYTICS_FLUSH_INTERVAL` | api | `3000` (prod `10000`) | Interval to flush analytics events. |
| `RI_ANALYTICS_START_EVENTS` | api | `false` | Emit analytics events on startup. |
| `RI_SENTRY_DSN` 🔑 | ui, desktop | `` (empty) | Sentry DSN for error reporting. |
| `RI_SENTRY_ENABLED` | ui, desktop | `false` | Enable Sentry error reporting. |
| `RI_SENTRY_ENVIRONMENT` | ui, desktop | `development` | Sentry environment tag. |
| `RI_SENTRY_AUTH_TOKEN` 🔑 | build | _(unset)_ | Sentry auth token for uploading source maps at build time. |
| `RI_SENTRY_ORG` | build | _(unset)_ | Sentry org slug (build-time source-map upload). |
| `RI_SENTRY_PROJECT` | build | _(unset)_ | Sentry project slug (build-time source-map upload). |

## Logging

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_LOG_LEVEL` | api | `info` (dev `debug`) | Log level. |
| `RI_STDOUT_LOGGER` | api | `false` (dev/staging `true`) | Log to stdout. |
| `RI_FILES_LOGGER` | api | `true` | Log to files. |
| `RI_LOGGER_OMIT_DATA` | api | `true` (dev/staging `false`) | Omit potentially sensitive data from logs. |
| `RI_LOGGER_PIPELINE_SUMMARY_LIMIT` | api | `5` | Number of pipeline commands summarized in logs. |
| `RI_LOGGER_DEPTH_LEVEL` | api | `5` | Object depth when serializing log data. |

## Features, tutorials & static content

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_FEATURES_CONFIG_URL` | api | GitHub `features-config.json` | Remote feature-flags config URL. |
| `RI_FEATURES_CONFIG_SYNC_INTERVAL` | api | `86400000` (24h) | Interval to re-fetch the feature-flags config. |
| `RI_FEATURES_ENV_DEPENDENT_DEFAULT_FLAG` | ui | `true` | Default value for the env-dependent feature group. |
| `RI_FEATURES_CLOUD_ADS_DEFAULT_FLAG` | ui | `true` | Default value for the cloud-ads feature. |
| `RI_STATICS_INIT_DEFAULTS` | api | `true` | Initialize bundled default statics on startup. |
| `RI_STATICS_AUTO_UPDATE` | api | `true` | Auto-update static content from remote. |
| `RI_CUSTOM_TUTORIALS_ENABLED` | api | `false` | Enable custom tutorials (deprecated feature, off by default). |
| `RI_TUTORIALS_UPDATE_URL` | api | GitHub Tutorials release | Remote tutorials package URL. |
| `RI_TUTORIALS_ZIP` / `RI_TUTORIALS_INFO` | api | `data.zip` / `build.json` | Tutorials archive and build-info filenames. |
| `RI_CONTENT_UPDATE_URL` | api | GitHub Statics release | Remote static-content package URL. |
| `RI_CONTENT_ZIP` / `RI_CONTENT_INFO` | api | `data.zip` / `build.json` | Content archive and build-info filenames. |
| `RI_COMMANDS_MAIN_URL` | api | redis-doc `commands.json` | Core Redis command docs source. |
| `RI_COMMANDS_REDISEARCH_URL` / `RI_COMMANDS_REDIJSON_URL` / `RI_COMMANDS_REDISTIMESERIES_URL` / `RI_COMMANDS_REDISGRAPH_URL` / `RI_COMMANDS_REDISGEARS_URL` / `RI_COMMANDS_REDISBLOOM_URL` | api | per-module GitHub `commands.json` | Command-docs sources for each Redis module. |

## Notifications

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_NOTIFICATION_UPDATE_URL` | api | GitHub `notifications.json` | Remote in-app notifications source. |
| `RI_NOTIFICATION_DEV_PATH` | api | _(unset)_ | Local notifications file; setting it enables notifications "dev mode" and overrides the update URL. |
| `RI_NOTIFICATION_SYNC_INTERVAL` | api | `3600000` (1h) | Interval to re-fetch notifications. |
| `RI_NOTIFICATION_QUERY_LIMIT` | api | `20` | Max notifications fetched/shown. |

## Sockets

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_SOCKETS_SERVE_CLIENT` | api | `false` | Serve the Socket.IO client script from the server. |
| `RI_SOCKETS_NAMESPACE_PREFIX` | api | `` (empty) | Prefix applied to Socket.IO namespaces. |
| `RI_SOCKETS_CORS` | api | `false` (dev `true`) | Enable CORS for Socket.IO. |
| `RI_SOCKETS_CORS_ORIGIN` | api | `*` | Allowed Socket.IO CORS origin(s). |
| `RI_SOCKETS_CORS_CREDENTIALS` | api | `false` | Allow credentialed Socket.IO CORS requests. |
| `RI_SOCKET_TRANSPORTS` | ui | _(unset)_ | Comma-separated Socket.IO transports the UI uses (e.g. `websocket`). |
| `RI_SOCKET_CREDENTIALS` | ui | `false` | Send credentials with the UI's Socket.IO connection. |
| `RI_HOSTED_SOCKET_PROXY_PATH` | ui | _(unset)_ | Socket.IO proxy path for hosted deployments. |

## UI-only / build-time

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_HOSTED_API_BASE_URL` | ui | `` (empty) | API base URL for hosted (cloud-served) UI builds. |
| `RI_HOSTED_BASE` | ui | `` (empty) | Base path for hosted UI builds. |
| `RI_CSRF_ENDPOINT` | ui | `` (empty) | Endpoint the UI calls to obtain a CSRF token. |
| `RI_RESOURCES_BASE_URL` | ui | API URL | Base URL for remote UI resources. |
| `RI_LOCAL_RESOURCES_BASE_URL` | ui | _(unset)_ | Base URL for locally served resources. |
| `RI_USE_LOCAL_RESOURCES` | ui | `false` | Use local resources instead of remote. |
| `RI_DEFAULT_THEME` | ui | `SYSTEM` | Default UI theme: `SYSTEM`, `DARK`, `LIGHT`. |
| `RI_401_REDIRECT_URL` | ui | `` (empty) | URL to redirect to on unauthenticated (401) responses. |
| `RI_SM_REDIRECT_URL` | ui | `` (empty) | Redirect URL to the Redis Software console. |
| `RI_DB_UPGRADE_REDIRECT_URL` | ui | `` (empty) | Base redirect URL for database-upgrade flows. |
| `RI_RETURN_URL_BASE` | ui | _(unset)_ | Base URL for the "return/back" navigation control. |
| `RI_RETURN_URL_LABEL` | ui | `Back` | Label for the return control. |
| `RI_RETURN_URL_TOOLTIP` | ui | `Back` | Tooltip for the return control. |
| `RI_ACTIVITY_MONITOR_ORIGIN` | ui | _(unset)_ | Allowed origin for the embedded activity monitor. |
| `RI_ACTIVITY_MONITOR_THROTTLE_TIMEOUT` | ui | `30000` | Activity-monitor event throttle interval (ms). |
| `RI_SESSION_TTL_SECONDS` | ui | `1800` (30m) | UI session time-to-live. |
| `RI_ROUTES_LAZY_LOAD` | ui | `false` | Lazy-load routes. |
| `RI_ROUTES_EXCLUDED_BY_ENV` | ui | `false` | Exclude certain routes based on environment. |
| `RI_SHOW_BUILD_COMMIT_SHA` | ui | `true` in non-production | Show the build commit SHA in the UI. |
| `RI_INDEXED_DB_NAME` | ui | `RI_LOCAL_STORAGE` | IndexedDB database name for local storage. |
| `RI_VECTOR_SEARCH_INDEXED_DB_NAME` | ui | `RI_VECTOR_SEARCH_STORAGE` | IndexedDB name for vector-search storage. |
| `RI_QUERY_LIBRARY_INDEXED_DB_NAME` | ui | `RI_QUERY_LIBRARY` | IndexedDB name for the query library. |
| `RI_SHOULD_GET_RECOMMENDATIONS` | ui | `false` | Fetch database recommendations. |

## Desktop / Electron

The desktop app has **no `.env` loader** — set these in the environment (see
[How configuration is loaded](#how-configuration-is-loaded)). Flags marked _presence-only_
are enabled by being **set to any value** (including `false`); to disable them, leave them
**unset**.

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_UPGRADES_LINK` | desktop | _(unset)_ | URL the auto-updater checks for upgrades. |
| `RI_MANUAL_UPGRADES_LINK` | desktop | _(unset)_ | URL used for manual upgrade downloads. |
| `RI_DISABLE_AUTO_UPGRADE` | desktop | `false` | Disable automatic upgrades (compared to `'true'`, so `false`/unset keeps upgrades on). |
| `RI_AUTO_UPDATE_INTERVAL` | desktop | _(unset)_ | Interval between auto-update checks. |
| `START_MINIMIZED` | desktop | _(unset)_ | **Presence-only.** Set to any value to start the Electron window minimized; leave unset to show it normally. |
| `UPGRADE_EXTENSIONS` | desktop | _(unset)_ | **Presence-only.** Set to any value to force-install/upgrade dev browser extensions (dev only). Leave unset to disable. |
| `USE_TCP_CLOUD_AUTH` | desktop | `false` | Use TCP (instead of a custom protocol) for the cloud OAuth callback (compared to `'true'`). |
| `TCP_LOCAL_AUTH_PORT` | desktop | _(unset)_ | Local TCP port for the OAuth callback listener. |
| `TCP_LOCAL_CLOUD_AUTH_PORT` | desktop | _(unset)_ | Local TCP port for the cloud OAuth callback listener. |

## Pre-setup databases (auto-add on startup)

RedisInsight can auto-add one or more Redis databases at startup from environment variables.
Each database is defined by an `RI_REDIS_HOST` variable; a numeric suffix (`_1`, `_2`, …)
distinguishes multiple databases. All other keys for that database use the **same suffix**.
See [`pre-setup.discovery.util.ts`](../redisinsight/api/src/modules/database-discovery/utils/pre-setup.discovery.util.ts).

| Variable (per database, `{n}` = suffix) | Default | Description |
|------------------------------------------|---------|-------------|
| `RI_REDIS_HOST{n}` | _(required)_ | Redis host — presence of this key defines a database. |
| `RI_REDIS_PORT{n}` | `6379` | Redis port. |
| `RI_REDIS_DB{n}` | `0` | Logical DB index. |
| `RI_REDIS_ALIAS{n}` | _(unset)_ | Display name for the connection. |
| `RI_REDIS_USERNAME{n}` 🔑 | _(unset)_ | ACL username. |
| `RI_REDIS_PASSWORD{n}` 🔑 | _(unset)_ | Password. |
| `RI_REDIS_TLS{n}` | `false` | Set to `true` to enable TLS. |
| `RI_REDIS_COMPRESSOR{n}` | _(unset)_ | Data compressor (e.g. `GZIP`, `LZ4`). |
| `RI_REDIS_TLS_CA_BASE64{n}` / `RI_REDIS_TLS_CA_PATH{n}` 🔑 | _(unset)_ | CA certificate as base64 or file path. |
| `RI_REDIS_TLS_CERT_BASE64{n}` / `RI_REDIS_TLS_CERT_PATH{n}` 🔑 | _(unset)_ | Client certificate as base64 or file path. |
| `RI_REDIS_TLS_KEY_BASE64{n}` / `RI_REDIS_TLS_KEY_PATH{n}` 🔑 | _(unset)_ | Client key as base64 or file path. |

Example — one non-TLS database:

```dotenv
RI_REDIS_HOST=redis.example.com
RI_REDIS_PORT=6380
RI_REDIS_ALIAS=Production
RI_REDIS_PASSWORD=<password>
```

## Redis Stack

Used only when `RI_BUILD_TYPE=REDIS_STACK`.

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `RI_REDIS_STACK_DATABASE_ID` | api | `redis-stack` | ID of the pre-configured Redis Stack database. |
| `RI_REDIS_STACK_DATABASE_NAME` | api | _(unset)_ | Display name. |
| `RI_REDIS_STACK_DATABASE_HOST` | api | _(unset)_ | Host. |
| `RI_REDIS_STACK_DATABASE_PORT` | api | _(unset)_ | Port. |

## Build & CI

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `NODE_ENV` | api, ui, build | `development` | Node environment; selects the backend config overlay (`production`/`staging`/`test`). |
| `RI_DB_SYNC` | api | `false` (dev `true`) | Auto-synchronize the local DB schema (TypeORM). |
| `RI_DB_MIGRATIONS` | api | `true` (dev `false`) | Run DB migrations on startup. |
| `CI` | build | _(unset)_ | Set by CI systems; toggles CI-specific behaviour. |
| `COLLECT_COVERAGE` | build | _(unset)_ | Collect test coverage during builds. |
| `SKIP_API_CLIENT_GEN` | build | _(unset)_ | Skip API client code generation. |
| `GITHUB_SHA` | ui, build | _(unset)_ | Commit SHA (set by GitHub Actions); shown as the UI build SHA. |
| `BUILD_PACKAGE` | build/desktop | _(unset)_ | Target package/platform for desktop builds. |

## E2E tests

The Playwright suite ([`tests/e2e-playwright/`](../tests/e2e-playwright/)) has its own
template — see [`example.env`](../tests/e2e-playwright/example.env) and the
[README](../tests/e2e-playwright/README.md). Highlights:

| Variable | Default | Description |
|----------|---------|-------------|
| `RI_CLIENT_URL` | `http://localhost:8080` | URL of the running UI under test. |
| `RI_API_URL` | `http://localhost:5540` | URL of the running API under test. |
| `RI_ELECTRON_API_URL` | _(unset)_ | API URL when testing the Electron build. |
| `ELECTRON_EXECUTABLE_PATH` | platform-specific | Path to the built Electron binary. |
| `ENV` | `local` | Selects the env file to load: `.env.{ENV}` (e.g. `ENV=staging`). |
| `OSS_STANDALONE_*`, `OSS_CLUSTER_*`, `OSS_SENTINEL_*` | see template | Host/port (and password) of the Redis instances started by docker-compose. |
| `HEADLESS` | _(unset)_ | Run the browser headless. |

The **legacy** suite ([`tests/e2e/`](../tests/e2e/)) uses a separate `TEST_*` variable family
(`TEST_REDIS_HOST`, `TEST_CLOUD_*`, `TEST_RTE_*`, `TEST_SSH_*`, …) plus `MOCK_AKEY` /
`MOCK_RKEY` / `MOCK_IDP_TYPE`. These are defined in that suite's own `.env`; see
[`tests/e2e/.env`](../tests/e2e/.env).

## Appendix: variables set by tooling, not RedisInsight

The repository also references many environment variables that belong to the toolchain, not
to RedisInsight. **Do not put these in a RedisInsight `.env` file** — they are documented by
their respective projects:

- **Node.js**: `NODE_OPTIONS`, `NODE_TLS_REJECT_UNAUTHORIZED`, `NODE_COMPILE_CACHE`, `PATH`, `HOME`, `TMPDIR`, `TERM`, …
- **Vite / esbuild**: `VITE_*`, `ESBUILD_*`
- **Babel**: `BABEL_*`
- **Browserslist**: `BROWSERSLIST_*`
- **Electron / packaging**: `ELECTRON_*`, `APPIMAGE`, `SNAP*`
- **chromedriver / test infra**: `CHROMEDRIVER_*`, `npm_config_*`, `DOTENV_CONFIG_*`, `__TESTING_*`
- **CI providers**: `GITHUB_TOKEN`, `GH_TOKEN`, `TRAVIS_*`, `SAUCE_*`

Refer to the documentation of the corresponding tool for their meaning and defaults.
