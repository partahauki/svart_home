#! /bin/bash

if [ "$(docker ps -a -q -f name=mqtt-broker)" ]; then
    if [ "$(docker ps -aq -f status=exited -f name=mqtt-broker)" ]; then
        docker start mqtt-broker
    fi
    docker attach mqtt-broker
fi

docker run -it --name mqtt-broker -p 1883:1883 -p 15675:15675 rabbit-mqtt:latest