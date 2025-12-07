#!/usr/bin/env bash

curl --request GET -sL \
     --url 'https://s3.amazonaws.com/garnetinsight.test/public/custom_plugins/plugins.zip'\
     --output './plugins.zip'

echo "Custom plugins archive was downloaded"

mkdir -p .redis-insight
unzip -o plugins.zip -d ./.redis-insight/plugins

echo "Custom plugins were unarchived"

exec "$@"
