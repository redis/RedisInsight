FROM --platform=linux/amd64 redis:7.0.0

USER root

COPY cluster-create.sh ./

RUN chmod a+x cluster-create.sh

CMD ["/bin/sh", "./cluster-create.sh"]
