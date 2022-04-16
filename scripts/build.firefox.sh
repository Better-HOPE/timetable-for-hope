#!/bin/bash

npm run build:core

mkdir -p ./build/firefox

cp ./src/manifest.firefox.json ./build/firefox/manifest.json

cp ./build/core/* ./build/firefox

cd build/firefox

zip -r -FS ../timetable-for-hope.xpi .

cd -

git archive HEAD --output=./build/source-for-amo.zip
