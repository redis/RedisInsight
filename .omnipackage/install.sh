#!/usr/bin/env bash
# Builds RedisInsight from source and stages it into the package buildroot.
# Mirrors the project's real Linux pipeline (.github/.../install-all-build-libs +
# pipeline-build-linux.yml): yarn install in root + redisinsight + redisinsight/api,
# build plugins (build:statics), then `package:prod --linux dir` (electron-builder
# rebuilds native modules against Electron's ABI and emits release/linux-unpacked).
# That unpacked tree is staged into /opt/redisinsight (the path the app's own deb
# hooks already expect), with a /usr/bin launcher, .desktop entry and icons.
#
# $1 = staging root (%{buildroot} for rpm, debian/redisinsight for deb).

source /profile

set -xEeuo pipefail

BUILDROOT=$1
APPDIR=/opt/redisinsight

export HUSKY=0
export CI=true
# Electron + vite/webpack builds are memory hungry.
export NODE_OPTIONS=--max_old_space_size=4096
# Force the Electron app flavour (matches RI_APP_TYPE in the CI linux pipeline).
export RI_APP_TYPE=ELECTRON

# --- toolchain ---------------------------------------------------------------
nvm install        # reads .nvmrc (22.22.0)
nvm use
npm install -g yarn
node -v
yarn -v

# --- dependencies (three trees, exactly like install-all-build-libs) ---------
yarn --cwd redisinsight install --frozen-lockfile --network-timeout 1000000
yarn --cwd redisinsight/api install --frozen-lockfile --network-timeout 1000000
yarn install --frozen-lockfile --network-timeout 1000000

# OpenAPI client is gitignored and normally produced by the api postinstall.
if [ ! -f redisinsight/api-client/index.ts ]; then
  yarn --cwd redisinsight/api generate:api-client
fi

# --- build -------------------------------------------------------------------
yarn build:statics                  # plugins + vendor assets
yarn package:prod --linux dir       # build:prod + electron-builder -> release/linux-unpacked

# --- stage -------------------------------------------------------------------
UNPACKED=$(ls -d release/linux-*unpacked 2>/dev/null | head -1)
if [ -z "$UNPACKED" ]; then
  echo "ERROR: electron-builder did not produce a linux-unpacked directory" >&2
  ls -la release || true
  exit 1
fi

install -d -m755 "$BUILDROOT$APPDIR"
cp -a "$UNPACKED/." "$BUILDROOT$APPDIR/"

install -d -m755 "$BUILDROOT/usr/bin"
ln -sf "$APPDIR/redisinsight" "$BUILDROOT/usr/bin/redisinsight"

# Desktop entry. Exec points at the staged binary; redisinsight:// scheme handler
# matches the protocol registered in electron-builder.json.
install -d -m755 "$BUILDROOT/usr/share/applications"
cat > "$BUILDROOT/usr/share/applications/redisinsight.desktop" <<EOF
[Desktop Entry]
Name=Redis Insight
GenericName=Redis GUI
Comment=Redis GUI by Redis Ltd
Exec=$APPDIR/redisinsight %U
Icon=redisinsight
Type=Application
StartupNotify=true
StartupWMClass=redisinsight
Categories=Development;Database;
MimeType=x-scheme-handler/redisinsight;
EOF

# Icons (hicolor). resources/icons ships square PNGs per size.
for size in 16 24 32 48 64 96 128 256 512; do
  src="resources/icons/${size}x${size}.png"
  [ -f "$src" ] || continue
  install -d -m755 "$BUILDROOT/usr/share/icons/hicolor/${size}x${size}/apps"
  install -m644 "$src" "$BUILDROOT/usr/share/icons/hicolor/${size}x${size}/apps/redisinsight.png"
done
