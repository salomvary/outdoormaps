#!/bin/sh
set -e
cd dist
git clean -f
git rm -rf *
cd ..
grunt build
cd dist
git add -A
git commit -m "update"
cd ..
