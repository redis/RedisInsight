FROM node:20.14-alpine

# runtime args and environment variables
ARG DIST=Redis-Insight.tar.gz
ARG NODE_ENV=production
ARG RI_SEGMENT_WRITE_KEY
ENV RI_SEGMENT_WRITE_KEY=${RI_SEGMENT_WRITE_KEY}
ENV NODE_ENV=${NODE_ENV}
ENV RI_SERVE_STATICS=true
ENV RI_BUILD_TYPE='DOCKER_ON_PREMISE'
ENV RI_APP_FOLDER_ABSOLUTE_PATH='/data'

# this resolves CVE-2023-5363
# TODO: remove this line once we update to base image that doesn't have this vulnerability
RUN apk update && apk upgrade --no-cache libcrypto3 libssl3

# set workdir
WORKDIR /usr/src/app

# copy artifacts built in previous stage to this one
ADD $DIST /usr/src/app/garnetinsight
RUN ls -la /usr/src/app/garnetinsight

# folder to store local database, plugins, logs and all other files
RUN mkdir -p /data && chown -R node:node /data

# copy the docker entry point script and make it executable
COPY --chown=node:node ./docker-entry.sh ./
RUN chmod +x docker-entry.sh

# since RI is hard-code to port 5540, expose it from the container
EXPOSE 5540

# don't run the node process as root
USER node

# serve the application 🚀
ENTRYPOINT ["./docker-entry.sh", "node", "garnetinsight/api/dist/src/main"]
