FROM redislabs/redis:6.2.8-50

## Set the env var to instruct RE to create a cluster on startup
ENV BOOTSTRAP_ACTION create_cluster
ENV BOOTSTRAP_CLUSTER_FQDN cluster.local

USER root
RUN sed -i "141s/username,/username, 'flash_enabled',/g" bootstrap.py
USER redislabs

COPY entrypoint.sh db.json ./

ENTRYPOINT [ "bash", "./entrypoint.sh" ]
