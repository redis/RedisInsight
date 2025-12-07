FROM redis:6.2.6-alpine
COPY redis.conf users.acl certs/* /etc/redis/
ENTRYPOINT [ "redis-server", "/etc/redis/redis.conf" ]
