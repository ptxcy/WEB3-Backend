#!/bin/bash
export MONGODB_VERSION=6.0-ubi8

if [ "$1" == "--clean-build" ]; then
    docker system prune -a --volumes -f
    docker run --name mongodb -d -p 27017:27017 mongodb/mongodb-community-server:$MONGODB_VERSION
elif [ "$1" == "-start" ] || [ -z "$1" ]; then
    docker run --name mongodb -d -p 27017:27017 mongodb/mongodb-community-server:$MONGODB_VERSION
else
    echo "Invalid or none parameter to use DB!"
    echo "Use: --clean-build -start"
    exit 1
fi
