#!/bin/bash
set -e

# install deps
npm ci
npm ci --prefix redisinsight/api

# build

npm run build:statics
npm run build:ui
npm run build:prod --prefix redisinsight/api
