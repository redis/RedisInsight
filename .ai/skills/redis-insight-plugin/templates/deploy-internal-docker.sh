#!/usr/bin/env bash
# Deploy a Redis Insight plugin into a running Docker RedisInsight container.
#
# Usage:
#   bash templates/deploy-internal-docker.sh [plugin-name] [container-name]
#
# Defaults:
#   plugin-name    -> read from package.json
#   container-name -> redisinsight-test
#
# Insight does not watch the user plugins folder inside its Docker image, so
# plugins must be copied to the static plugins folder and the container restarted.

set -euo pipefail

PLUGIN_ROOT="$(pwd)"
MANIFEST="$PLUGIN_ROOT/package.json"

PLUGIN_NAME="${1:-$(node -p "require('$MANIFEST').name")}"
CONTAINER="${2:-redisinsight-test}"
INSIGHT_PLUGINS_DIR="/usr/src/app/redisinsight/api/dist/static/plugins"
DEST="$INSIGHT_PLUGINS_DIR/$PLUGIN_NAME"

echo "deploy(docker): plugin=$PLUGIN_NAME container=$CONTAINER dest=$DEST"

# 1. Build
yarn build

# 2. Verify
bash "$PLUGIN_ROOT/templates/verify-plugin.sh" \
  || bash "$PLUGIN_ROOT/scripts/verify-plugin.sh"

# 3. Strip dev-only fields and write the deployed manifest
TMP_MANIFEST="$(mktemp -t ri-plugin-manifest.XXXXXX.json)"
node -e "
  const fs = require('fs');
  const m = require('$MANIFEST');
  for (const k of ['scripts','devDependencies','targets','husky','lint-staged','source']) delete m[k];
  fs.writeFileSync('$TMP_MANIFEST', JSON.stringify(m, null, 2));
"

# 4. Copy into the container
docker exec "$CONTAINER" mkdir -p "$DEST/dist"
docker cp "$TMP_MANIFEST" "$CONTAINER:$DEST/package.json"
docker cp "$PLUGIN_ROOT/dist/." "$CONTAINER:$DEST/dist/"
rm -f "$TMP_MANIFEST"

# 5. Restart the container
docker restart "$CONTAINER" >/dev/null

# 6. Verify via /api/plugins
echo "deploy(docker): waiting for Insight to come back up..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sf http://localhost:5540/api/plugins >/dev/null; then break; fi
  sleep 1
done

curl -s http://localhost:5540/api/plugins | grep -q "\"$PLUGIN_NAME\"" \
  && echo "deploy(docker): $PLUGIN_NAME present in /api/plugins" \
  || { echo "deploy(docker): $PLUGIN_NAME NOT present in /api/plugins" >&2; exit 1; }
