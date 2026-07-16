FROM node:22.22.0-alpine as test

RUN apk update && apk add bash libsecret dbus-x11 gnome-keyring python3 py3-setuptools make g++
RUN dbus-uuidgen > /var/lib/dbus/machine-id

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
# patch-package (postinstall) reads these, so they must exist before install —
# otherwise patches silently don't apply (e.g. the ioredis bigint parser).
COPY patches ./patches
COPY stubs ./stubs
COPY scripts ./scripts
# Skip API client generation during install: integration tests don't need the
# generated client, and the api source tree isn't COPYed in until after
# `npm ci` (the generator reads it to produce the OpenAPI spec).
ENV SKIP_API_CLIENT_GEN=1
RUN npm ci
COPY . .

COPY ./test/test-runs/test-docker-entry.sh ./test/test-runs/wait-for-it.sh ./
RUN chmod +x test-docker-entry.sh
RUN chmod +x wait-for-it.sh

ARG GNOME_KEYRING_PASS="somepass"
ENV GNOME_KEYRING_PASS=${GNOME_KEYRING_PASS}

ENTRYPOINT ["./test-docker-entry.sh"]
CMD ["npm", "run", "test:api:ci:cov"]
