#!/bin/bash

BASEDIR=$(dirname $0)
$BASEDIR/start-test-run.sh -r redis-5 |
$BASEDIR/start-test-run.sh -r redis-6
#echo "All Test Runs were executed"
