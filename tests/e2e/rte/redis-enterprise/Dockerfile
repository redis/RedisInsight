FROM redislabs/redis:8.0.2-17

# Create system group and user only if they don't already exist
USER root
RUN if ! getent group redis >/dev/null; then groupadd -r redis; fi && \
    if ! id -u redis >/dev/null 2>&1; then useradd -r -g redis -s /usr/sbin/nologin redis; fi

USER redis:redis

ENV BOOTSTRAP_ACTION create_cluster
ENV BOOTSTRAP_CLUSTER_FQDN cluster.local

COPY entrypoint.sh db.json ./

ENTRYPOINT [ "bash", "./entrypoint.sh" ]
