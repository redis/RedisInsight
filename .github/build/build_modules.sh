#!/bin/bash
set -e

PLATFORM=${PLATFORM:-'linux'}
ARCH=${ARCH:-'x64'}
LIBC=${LIBC:-''}
#FILENAME="Redis-Insight-$PLATFORM.$VERSION.$ARCH.zip"
FILENAME="Redis-Insight-web-$PLATFORM"
if [ ! -z $LIBC ]
then
  FILENAME="$FILENAME-$LIBC.$ARCH.tar.gz"
  export npm_config_target_libc="$LIBC"
else
  FILENAME="$FILENAME.$ARCH.tar.gz"
fi

echo "Building node modules..."
echo "Platform: $PLATFORM"
echo "Arch: $ARCH"
echo "Libc: $LIBC"
echo "npm target libc: $npm_config_target_libc"
echo "Filname: $FILENAME"

rm -rf garnetinsight/api/node_modules

npm_config_arch="$ARCH" \
npm_config_target_arch="$ARCH" \
npm_config_platform="$PLATFORM" \
npm_config_target_platform="$PLATFORM" \
yarn --cwd ./garnetinsight/api install --production

cp garnetinsight/api/.yarnclean.prod garnetinsight/api/.yarnclean
yarn --cwd ./garnetinsight/api autoclean --force

rm -rf garnetinsight/build.zip

cp LICENSE ./garnetinsight

cd garnetinsight && tar -czf build.tar.gz \
--exclude="api/node_modules/**/build/node_gyp_bins/python3" \
api/node_modules \
api/dist \
ui/dist \
LICENSE \
&& cd ..

mkdir -p release/web
cp garnetinsight/build.tar.gz release/web/"$FILENAME"

# Minify build via esbuild
echo "Start minifing workflow"
npm_config_arch="$ARCH" \
npm_config_target_arch="$ARCH" \
npm_config_platform="$PLATFORM" \
npm_config_target_platform="$PLATFORM" \
yarn --cwd ./garnetinsight/api install
yarn --cwd ./garnetinsight/api minify:prod


PACKAGE_JSON_PATH="./garnetinsight/api/package.json"
APP_PACKAGE_JSON_PATH="./garnetinsight/package.json"

# Extract dependencies from the app package.json
BINARY_PACKAGES=$(jq -r '.dependencies | keys[]' "$APP_PACKAGE_JSON_PATH" | jq -R -s -c 'split("\n")[:-1]')

# Keep class transformer external for minified builds since it is not bundled
BINARY_PACKAGES=$(echo "$BINARY_PACKAGES" | jq '. + ["class-transformer"]')

echo "Binary packages to exclude during minify: $BINARY_PACKAGES"

# Modify the package.json to keep only binary prod dependencies
# Additionally remove custom "postinstall" script to avoid patch-package error(s)
jq --argjson keep "$BINARY_PACKAGES" \
  'del(.devDependencies) | .dependencies |= with_entries(select(.key as $k | $keep | index($k))) | del(.scripts.postinstall)' \
  "$PACKAGE_JSON_PATH" > temp.json && mv temp.json "$PACKAGE_JSON_PATH"

npm_config_arch="$ARCH" \
npm_config_target_arch="$ARCH" \
npm_config_platform="$PLATFORM" \
npm_config_target_platform="$PLATFORM" \
yarn --cwd ./garnetinsight/api install --production
yarn --cwd ./garnetinsight/api autoclean --force

# Compress minified build
cd garnetinsight && tar -czf build-mini.tar.gz \
--exclude="api/node_modules/**/build/node_gyp_bins/python3" \
api/node_modules \
api/dist-minified \
ui/dist \
LICENSE \
&& cd ..

mkdir -p release/web-mini
cp garnetinsight/build-mini.tar.gz release/web-mini/"$FILENAME"

# Restore the original package.json and yarn.lock
git restore garnetinsight/api/yarn.lock garnetinsight/api/package.json

