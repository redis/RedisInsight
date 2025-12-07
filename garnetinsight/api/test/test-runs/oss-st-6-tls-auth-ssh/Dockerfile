FROM bitnamilegacy/redis:6.0.8

ENV ALLOW_EMPTY_PASSWORD yes

# TLS options
ENV REDIS_TLS_ENABLED yes
ENV REDIS_TLS_PORT 6379
ENV REDIS_TLS_CERT_FILE /opt/bitnami/redis/certs/redis.crt
ENV REDIS_TLS_KEY_FILE /opt/bitnami/redis/certs/redis.key
ENV REDIS_TLS_CA_FILE /opt/bitnami/redis/certs/redisCA.crt
ENV REDIS_TLS_AUTH_CLIENTS yes

COPY --chown=1001 ./certs /opt/bitnami/redis/certs/
