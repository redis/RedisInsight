#!/bin/bash
set -e

ARCH=${ARCH:-x64}
WORKING_DIRECTORY=$(pwd)
TAR_NAME="Redis-Insight-app-darwin.$ARCH.tar.gz"
RI_APP_FOLDER_NAME="Garnet Insight.app"
TMP_FOLDER="/tmp/$RI_APP_FOLDER_NAME"

rm -rf "$TMP_FOLDER"

mkdir -p "$WORKING_DIRECTORY/release/redisstack"
mkdir -p "$TMP_FOLDER"

hdiutil attach "./release/Redis-Insight-mac-$ARCH.dmg"
rsync -av /Volumes/Redis*/Redis\ Insight.app "/tmp"
cd "/tmp" || exit 1
tar -czvf "$TAR_NAME" "$RI_APP_FOLDER_NAME"
cp "$TAR_NAME" "$WORKING_DIRECTORY/release/redisstack/"
cd "$WORKING_DIRECTORY" || exit 1
hdiutil unmount /Volumes/Redis*/
