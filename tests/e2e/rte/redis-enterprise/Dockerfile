FROM redislabs/redis:8.0.2-17

## Set the env var to instruct RE to create a cluster on startup
ENV BOOTSTRAP_ACTION create_cluster
ENV BOOTSTRAP_CLUSTER_FQDN cluster.local

COPY entrypoint.sh db.json ./

ENTRYPOINT [ "bash", "./entrypoint.sh" ]
