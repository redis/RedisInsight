FROM --platform=linux/amd64 redislabs/rejson:1.0.8 AS rejson

FROM --platform=linux/amd64 redis:7.0.8

COPY redis.conf /etc/redis/
COPY --from=rejson /usr/lib/redis/modules/rejson.so /etc/redis/modules/

CMD ls -la
RUN ls -la /etc/redis/modules

ADD https://s3.amazonaws.com/garnetinsight.test/public/rte/modules/redisearch-coord/redisearch-coord.so.tar.gz .

RUN ls -la
RUN ls -la /etc/redis/modules
RUN tar -xvzf redisearch-coord.so.tar.gz && rm redisearch-coord.so.tar.gz && cp redisearch-coord.so /etc/redis/modules
RUN ls -la
RUN ls -la /etc/redis/modules

CMD [ "redis-server", "/etc/redis/redis.conf" ]
