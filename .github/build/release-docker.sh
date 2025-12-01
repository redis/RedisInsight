#!/bin/bash
set -e

HELP="Args:
-v - Semver (2.69.10)
-d - Build image repository (Ex: -d redisinsight)
-r - Target repository (Ex: -r redis/redisinsight)
"

while getopts "v:d:r:h:" opt; do
  case $opt in
    v) VERSION="$OPTARG";;
    d) DEV_REPO="$OPTARG";;
    r) RELEASE_REPO="$OPTARG";;
    h) echo "$HELP"; exit 0;;
    ?) echo "$HELP" >&2; exit 1 ;;
  esac
done

V_ARR=( ${VERSION//./ } )
TAGS[0]=$VERSION
TAGS[1]="${V_ARR[0]}.${V_ARR[1]}"
TAGS[2]="latest"

DEV_IMAGE_AMD64=$DEV_REPO:amd64
DEV_IMAGE_ARM64=$DEV_REPO:arm64
RELEASE_IMAGE_AMD64=$RELEASE_REPO:$VERSION-amd64
RELEASE_IMAGE_ARM64=$RELEASE_REPO:$VERSION-arm64

echo "
  TAGS: [${TAGS[0]}, ${TAGS[1]}, ${TAGS[2]}]
  DEV_REPO: $DEV_REPO
  RELEASE_REPO: $RELEASE_REPO

  DEV_IMAGE_AMD64: $DEV_IMAGE_AMD64
  DEV_IMAGE_ARM64: $DEV_IMAGE_ARM64

  RELEASE_IMAGE_AMD64: $RELEASE_IMAGE_AMD64
  RELEASE_IMAGE_ARM64: $RELEASE_IMAGE_ARM64
"

# Load images from tar archives
docker rmi $DEV_IMAGE_AMD64 || true
docker rmi $DEV_IMAGE_ARM64 || true
docker load -i release/docker-linux-alpine.amd64.tar
docker load -i release/docker-linux-alpine.arm64.tar

echo "Push AMD64 image"
docker tag $DEV_IMAGE_AMD64 $RELEASE_IMAGE_AMD64
docker push $RELEASE_IMAGE_AMD64

echo "Push ARM64 image"
docker tag $DEV_IMAGE_ARM64 $RELEASE_IMAGE_ARM64
docker push $RELEASE_IMAGE_ARM64

for TAG in "${TAGS[@]}"; do
    echo "Releasing: $RELEASE_REPO:$TAG"
    docker manifest rm $RELEASE_REPO:$TAG || true
    docker manifest create --amend "$RELEASE_REPO:$TAG" $RELEASE_IMAGE_AMD64 $RELEASE_IMAGE_ARM64
    docker manifest push "$RELEASE_REPO:$TAG"
done

echo "Success"
