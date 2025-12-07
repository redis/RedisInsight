#!/bin/bash
set -e

# install deps
yarn
yarn --cwd garnetinsight/api

# build

yarn build:statics
yarn build:ui
yarn --cwd ./garnetinsight/api build:prod
