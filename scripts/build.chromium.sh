#!/bin/bash

TARGET=firefox npm run build:core

mkdir -p ./build/chromium

cp ./src/manifest.chromium.json ./build/chromium/manifest.json

cp ./build/core/* ./build/chromium

cd build/

zip -r -FS ./timetable-for-hope-chrome-webstore.zip chromium

cd -
