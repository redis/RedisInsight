FROM redislabs/redis:6.2.8-50

## Set the env var to instruct RE to create a cluster on startup
ENV BOOTSTRAP_ACTION create_cluster
ENV BOOTSTRAP_CLUSTER_FQDN cluster.local

COPY entrypoint.sh db.json ./

ENTRYPOINT [ "bash", "./entrypoint.sh" ]
