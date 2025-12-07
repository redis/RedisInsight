FROM redis:6.2.6-alpine
COPY redis.conf users.acl /etc/redis/
ENTRYPOINT [ "redis-server", "/etc/redis/redis.conf" ]
