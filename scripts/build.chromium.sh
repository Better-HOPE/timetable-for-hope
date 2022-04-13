#!/bin/bash

mkdir -p ./build/chromium

cp ./src/manifest.chromium.json ./build/chromium/manifest.json

cp ./src/index.js ./build/chromium

cd build/chromium

zip -r -FS ../hope-timetable-chrome-webstore.zip .

cd -
