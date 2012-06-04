#!/bin/sh
git checkout gh-pages
git merge master
node ./build.js
git add -A
git commit -m "version bump"
git checkout master
