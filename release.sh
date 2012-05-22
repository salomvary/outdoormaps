#!/bin/sh
git checkout gh-pages
git merge master
sed -i ""  -e "s/VERSION.*/VERSION `git rev-parse --short HEAD`/"  manifest.appcache
git add manifest.appcache
git commit -m "version bump"
git checkout master
