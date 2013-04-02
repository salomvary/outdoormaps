#!/bin/sh
set -e
cd gh-pages
git rm -rf *
cd ..
grunt compile
cd gh-pages
git add -A
git commit -m "update"
cd ..
