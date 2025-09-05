FROM --platform=linux/amd64 redis:7.0.6

USER root

COPY cluster-rs-create.sh ./

RUN chmod a+x cluster-rs-create.sh

CMD ["/bin/sh", "./cluster-rs-create.sh"]
