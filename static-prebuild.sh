#!/usr/bin/env bash

mkdir -p public

cp src/static/logo.png public
cp src/static/logo.svg public
cp src/static/landing/example-list.png public
cp -r node_modules/@fortawesome/fontawesome-free/ public
