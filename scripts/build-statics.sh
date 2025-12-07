#!/bin/bash
set -e

pluginsOnlyInstall="${pluginsOnlyInstall:-0}"

# =============== Plugins ===============
PLUGINS_DIR="./garnetinsight/api/static/plugins"
PLUGINS_VENDOR_DIR="./garnetinsight/api/static/resources/plugins"

# Default plugins assets
sass "./garnetinsight/ui/src/styles/main_plugin.scss" "./vendor/global_styles.css" --style=compressed --no-source-map;
sass "./garnetinsight/ui/src/styles/themes/dark_theme/darkTheme.scss" "./vendor/dark_theme.css" --style=compressed --no-source-map;
sass "./garnetinsight/ui/src/styles/themes/light_theme/lightTheme.scss" "./vendor/light_theme.css" --style=compressed --no-source-map;
cp -R "./garnetinsight/ui/src/assets/fonts/graphik/" "./vendor/fonts"
cp -R "./garnetinsight/ui/src/assets/fonts/inconsolata/" "./vendor/fonts"
mkdir -p "${PLUGINS_VENDOR_DIR}"
cp -R "./vendor/." "${PLUGINS_VENDOR_DIR}"


# Install developing tools for plugins
PACKAGES_DIR="./garnetinsight/ui/src/packages"
yarn --cwd "${PACKAGES_DIR}"

# Install plugins dependencies
REDISEARCH_DIR="./garnetinsight/ui/src/packages/redisearch"
yarn --cwd "${REDISEARCH_DIR}"

REDISGRAPH_DIR="./garnetinsight/ui/src/packages/redisgraph"
yarn --cwd "${REDISGRAPH_DIR}"

REDISTIMESERIES_DIR="./garnetinsight/ui/src/packages/redistimeseries-app"
yarn --cwd "${REDISTIMESERIES_DIR}"

RI_EXPLIAIN_DIR="./garnetinsight/ui/src/packages/ri-explain"
yarn --cwd "${RI_EXPLIAIN_DIR}"

CLIENTS_LIST_DIR="./garnetinsight/ui/src/packages/clients-list"
yarn --cwd "${CLIENTS_LIST_DIR}"

# Build all plugins and common libraries
NODE_OPTIONS=--max_old_space_size=4096 yarn --cwd "${PACKAGES_DIR}" build

# Copy common libraries to plugins
COMMON_DIR="./garnetinsight/ui/src/packages/common"
if [ $pluginsOnlyInstall != 1 ]; then
  mkdir -p "${PLUGINS_DIR}/common"
  cp -R "${COMMON_DIR}/index"*.js "${COMMON_DIR}/package.json" "${PLUGINS_DIR}/common"
fi

# Copy redisearch plugin
if [ $pluginsOnlyInstall != 1 ]; then
  mkdir -p "${PLUGINS_DIR}/redisearch"
  cp -R "${REDISEARCH_DIR}/dist" "${REDISEARCH_DIR}/package.json" "${PLUGINS_DIR}/redisearch"
fi


# Copy redisgraph plugin
if [ $pluginsOnlyInstall != 1 ]; then
  mkdir -p "${PLUGINS_DIR}/redisgraph"
  cp -R "${REDISGRAPH_DIR}/dist" "${REDISGRAPH_DIR}/package.json" "${PLUGINS_DIR}/redisgraph"
fi

# Copy timeseries plugin
if [ $pluginsOnlyInstall != 1 ]; then
  mkdir -p "${PLUGINS_DIR}/redistimeseries-app"
  cp -R "${REDISTIMESERIES_DIR}/dist" "${REDISTIMESERIES_DIR}/package.json" "${PLUGINS_DIR}/redistimeseries-app"
fi

# Copy ri-explain plugin
if [ $pluginsOnlyInstall != 1 ]; then
  mkdir -p "${PLUGINS_DIR}/ri-explain"
  cp -R "${RI_EXPLIAIN_DIR}/dist" "${RI_EXPLIAIN_DIR}/package.json" "${PLUGINS_DIR}/ri-explain"
fi

# Copy clients-list and json plugins
if [ $pluginsOnlyInstall != 1 ]; then
  mkdir -p "${PLUGINS_DIR}/clients-list"
  cp -R "${CLIENTS_LIST_DIR}/dist" "${CLIENTS_LIST_DIR}/package.json" "${PLUGINS_DIR}/clients-list"
fi
