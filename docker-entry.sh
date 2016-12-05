#!/bin/bash

# Functions for dependencies health-check
function fail {
  echo $1 >&2
  exit 1
}

function retry {
  local n=1
  local max=10
  local delay=3
  while true; do
    "$@" && break || {
      if [[ $n -lt $max ]]; then
        ((n++))
        echo "Command failed. Attempt $n/$max:"
        sleep $delay;
      else
        fail "The command has failed after $n attempts."
      fi
    }
  done
}


# Try connections to ElasticSearch, and RabbitMQ.
retry /usr/bin/curl -s --fail -s cl-elasticsearch:9200 > /dev/null
retry /usr/bin/curl -s --fail -s cl-rabbitmq:15672 > /dev/null
sleep 2

# Execute the index_service process.
cd lib
node main.js
