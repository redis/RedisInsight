#!/bin/bash

BASEDIR=$(dirname $0)
BUILD="local"

helpFunction()
{
  printf "Some of the required parameters are empty\n\n"
  printf "Usage: %s -r RTE [-t local]\n" "$0"
  printf " -r - (required) Redis Test Environment (RTE). Should match any service name from redis.docker-compose.yml\n"
  printf " -f - (optional) force rebuild api image\n"
  printf " -t - Backend build type.
    \t local - (default) run server using source code
    \t docker - run server on built docker container
    "
  exit 1 # Exit script after printing help
}

# required params
while getopts "r:t:f" opt
do
   case "$opt" in
      r ) RTE="$OPTARG" ;;
      t ) BUILD="$OPTARG" ;;
      f ) FORCE_REBUILD=true ;;
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done
echo "BUILD: ${BUILD}"

# Print helpFunction in case parameters are empty
if [ -z "$RTE" ]
then
   helpFunction
fi

# Unique ID for the test run
ID=$RTE-$(tr -dc a-z0-9 </dev/urandom | head -c 6)

# Check if we need to run prestart script
PRESTART="$BASEDIR/$RTE/prestart.sh"
if test -f "$PRESTART"; then
    echo "Running prestart.sh script..."
    ID=$ID ./$PRESTART``
fi

echo "Pulling RTE... ${RTE}"
eval "ID=$ID RTE=$RTE docker compose \
  -f $BASEDIR/$BUILD.build.yml \
  -f $BASEDIR/$RTE/docker-compose.yml \
  --env-file $BASEDIR/$BUILD.build.env pull redis"

echo "Building RTE... ${RTE}"
eval "ID=$ID RTE=$RTE docker compose \
  -f $BASEDIR/$BUILD.build.yml \
  -f $BASEDIR/$RTE/docker-compose.yml \
  --env-file $BASEDIR/$BUILD.build.env build --no-cache redis"

if [ "$FORCE_REBUILD" = true ]; then
    echo "Force rebuilding api and test containers"
    eval "ID=$ID RTE=$RTE docker compose \
      -f $BASEDIR/$BUILD.build.yml \
      -f $BASEDIR/$RTE/docker-compose.yml \
      --env-file $BASEDIR/$BUILD.build.env build --no-cache test app"
fi

echo "Test run is starting... ${RTE}"
eval "ID=$ID RTE=$RTE docker compose -p $ID \
  -f $BASEDIR/$BUILD.build.yml \
  -f $BASEDIR/$RTE/docker-compose.yml \
  --env-file $BASEDIR/$BUILD.build.env run --build --use-aliases test"

# Remember exit code for tests
TEST_EXIT_CODE=$?

echo "Stop all containers... ${RTE}"
eval "ID=$ID RTE=$RTE docker compose -p $ID \
  -f $BASEDIR/$BUILD.build.yml \
  -f $BASEDIR/$RTE/docker-compose.yml \
  --env-file $BASEDIR/$BUILD.build.env stop"

echo "Remove containers with anonymous volumes... ${RTE}"
eval "ID=$ID RTE=$RTE docker compose -p $ID \
  -f $BASEDIR/$BUILD.build.yml \
  -f $BASEDIR/$RTE/docker-compose.yml \
  --env-file $BASEDIR/$BUILD.build.env rm -v -f"

echo "Removing test run docker network..."
eval "docker network rm $ID || true"

exit $TEST_EXIT_CODE
