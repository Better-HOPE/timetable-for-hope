#!/bin/bash

mkdir -p ./build/firefox

cp ./src/manifest.firefox.json ./build/firefox/manifest.json

cp ./src/index.js ./build/firefox

cd build/firefox

zip -r -FS ../hope-timetable.xpi .

cd -
