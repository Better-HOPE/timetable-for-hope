#!/bin/bash

npm run build:core

mkdir -p ./build/firefox

cp ./src/manifest.firefox.json ./build/firefox/manifest.json

cp ./build/core/* ./build/firefox

cd build/firefox

zip -r -FS ../hope-timetable.xpi .

cd -
