FROM redis:6.2.6-alpine
COPY sentinel.conf sentinel.users.acl /etc/redis/
ENTRYPOINT [ "redis-server", "/etc/redis/sentinel.conf", "--sentinel" ]
