FROM redis:6.2.6-alpine
COPY sentinel.conf users.acl certs/* /etc/redis/
ENTRYPOINT [ "redis-server", "/etc/redis/sentinel.conf", "--sentinel" ]
