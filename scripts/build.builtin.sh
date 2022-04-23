#!/bin/bash

TARGET=builtin npm run build:core

mkdir -p ./build/builtin

cp ./build/core/* ./build/builtin
