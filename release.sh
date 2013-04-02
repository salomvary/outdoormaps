#!/bin/sh
set -e
git checkout gh-pages
git reset --hard master
grunt compile
git add -A
git add -f vendor
git commit -m "version bump"
git rm -r --cached vendor
git commit -m "rm vendor"
git checkout master
