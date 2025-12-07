#!/bin/sh

if [ -e dump.tar.gz ]
then
  echo 'Extracting .rdb file...'
  tar -zxvf dump.tar.gz
fi

exec "$@"
