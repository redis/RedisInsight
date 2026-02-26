FROM node:22.12.0-alpine as test

RUN apk update && apk add bash libsecret dbus-x11 gnome-keyring
RUN dbus-uuidgen > /var/lib/dbus/machine-id

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY stubs ./stubs
RUN yarn install
COPY . .

COPY ./test/test-runs/test-docker-entry.sh ./test/test-runs/wait-for-it.sh ./
RUN chmod +x test-docker-entry.sh
RUN chmod +x wait-for-it.sh

ARG GNOME_KEYRING_PASS="somepass"
ENV GNOME_KEYRING_PASS=${GNOME_KEYRING_PASS}

ENTRYPOINT ["./test-docker-entry.sh"]
CMD ["yarn", "test:api:ci:cov"]
