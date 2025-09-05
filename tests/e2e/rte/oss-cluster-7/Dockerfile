FROM --platform=linux/amd64 redislabs/rejson:1.0.8 AS rejson

FROM --platform=linux/amd64 redislabs/redisearch:2.0.13 AS redisearch

FROM --platform=linux/amd64 redis:7.0.0

COPY redis.conf /etc/redis/
COPY --from=rejson /usr/lib/redis/modules/rejson.so /etc/redis/modules/
COPY --from=redisearch /usr/lib/redis/modules/redisearch.so /etc/redis/modules/

CMD [ "redis-server", "/etc/redis/redis.conf" ]
