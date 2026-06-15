#!/usr/bin/env bash
# Deploy a Redis Insight plugin to the user's plugins folder.
#
# Run from the plugin root (the folder containing package.json):
#   bash templates/deploy-external.sh
#
# Uses ~/.redis-insight/plugins/<name>/ on macOS/Linux. On Windows, deploy manually.

set -euo pipefail

PLUGIN_ROOT="$(pwd)"
MANIFEST="$PLUGIN_ROOT/package.json"
PLUGIN_NAME="$(node -p "require('$MANIFEST').name")"

DEST="${RI_PLUGINS_DIR:-$HOME/.redis-insight/plugins}/$PLUGIN_NAME"

echo "deploy: plugin=$PLUGIN_NAME dest=$DEST"

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

# 4. Copy to destination
mkdir -p "$DEST/dist"
cp "$TMP_MANIFEST" "$DEST/package.json"
cp -R "$PLUGIN_ROOT/dist/." "$DEST/dist/"
rm -f "$TMP_MANIFEST"

echo "deploy: copied to $DEST"
echo "deploy: restart Redis Insight, then verify with:"
echo "  curl -s http://localhost:5540/api/plugins | jq '.[] | select(.name==\"$PLUGIN_NAME\")'"
