#!/usr/bin/env bash
# Verify a Redis Insight plugin build before deploying.
#
# Run from the plugin root (the folder containing package.json):
#   bash templates/verify-plugin.sh
#
# Exits non-zero if any check fails.

set -euo pipefail

PLUGIN_ROOT="$(pwd)"
MANIFEST="$PLUGIN_ROOT/package.json"

if [[ ! -f "$MANIFEST" ]]; then
  echo "verify: package.json not found at $MANIFEST" >&2
  exit 1
fi

PLUGIN_NAME="$(node -p "require('$MANIFEST').name")"
MAIN_PATH="$(node -p "require('$MANIFEST').main || ''")"
STYLES_PATH="$(node -p "require('$MANIFEST').styles || ''")"

echo "verify: plugin=$PLUGIN_NAME main=$MAIN_PATH styles=$STYLES_PATH"

if [[ -z "$MAIN_PATH" ]]; then
  echo "verify: 'main' missing in package.json" >&2
  exit 1
fi

MAIN_ABS="$PLUGIN_ROOT/${MAIN_PATH#./}"
if [[ ! -f "$MAIN_ABS" ]]; then
  echo "verify: built bundle not found at $MAIN_ABS (run yarn build first)" >&2
  exit 1
fi

if [[ -n "$STYLES_PATH" ]]; then
  STYLES_ABS="$PLUGIN_ROOT/${STYLES_PATH#./}"
  if [[ ! -f "$STYLES_ABS" ]]; then
    echo "verify: declared styles not found at $STYLES_ABS" >&2
    exit 1
  fi
fi

ENV_HITS="$(grep -c "process.env" "$MAIN_ABS" || true)"
if [[ "$ENV_HITS" -ne 0 ]]; then
  echo "verify: bundle contains $ENV_HITS process.env references; replace at build time" >&2
  exit 1
fi

ACTIVATION_NAMES="$(node -e "
  const m = require('$MANIFEST');
  const v = m.visualizations || [];
  console.log(v.map(x => x.activationMethod).filter(Boolean).join('\n'));
")"

if [[ -z "$ACTIVATION_NAMES" ]]; then
  echo "verify: no visualizations declared in package.json" >&2
  exit 1
fi

while IFS= read -r NAME; do
  [[ -z "$NAME" ]] && continue
  if ! grep -q "$NAME" "$MAIN_ABS"; then
    echo "verify: activationMethod '$NAME' not found in bundle" >&2
    exit 1
  fi
done <<< "$ACTIVATION_NAMES"

BUNDLE_BYTES="$(wc -c < "$MAIN_ABS" | tr -d ' ')"
echo "verify: bundle size ${BUNDLE_BYTES} bytes"

echo "verify: OK"
