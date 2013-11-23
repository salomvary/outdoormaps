release:
	cd dist; git clean -f; git rm -rf *
	grunt build
	cd dist; git add -A; git commit -m "update"
