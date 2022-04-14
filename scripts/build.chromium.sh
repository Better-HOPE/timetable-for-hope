#!/bin/bash

npm run build:core

mkdir -p ./build/chromium

cp ./src/manifest.chromium.json ./build/chromium/manifest.json

cp ./build/core/* ./build/chromium

cd build/chromium

zip -r -FS ../hope-timetable-chrome-webstore.zip .

cd -
