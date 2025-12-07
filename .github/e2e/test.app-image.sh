#!/bin/bash
set -e

pkill -f Redis*  || true
rm -f apppath

yarn --cwd tests/e2e install

# mount app resources
chmod +x ./release/*.AppImage
./release/*.AppImage --appimage-mount >> apppath &

# wait briefly to allow the appimage mount command to output to the file
sleep 2

# log the content of apppath
echo "Content of apppath file:"
cat apppath

# create folder before tests run to prevent permissions issue
mkdir -p tests/e2e/remote
mkdir -p tests/e2e/rdi

# run rte
docker compose -f tests/e2e/rte.docker-compose.yml build
docker compose -f tests/e2e/rte.docker-compose.yml up --force-recreate -d -V
./tests/e2e/wait-for-redis.sh localhost 12000 && \

# run tests add TEST_DEBUG=1 to debug framework execution
TEST_DEBUG=0
[ "$TEST_DEBUG" = "1" ] && export DEBUG=testcafe:*
export COMMON_URL=$(tail -n 1 apppath)/resources/app.asar/dist/renderer/index.html
export ELECTRON_PATH=$(tail -n 1 apppath)/garnetinsight
export RI_SOCKETS_CORS=true
yarn --cwd tests/e2e dotenv -e .desktop.env yarn --cwd tests/e2e test:desktop:ci
