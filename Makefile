release:
	cd dist; git clean -f; git rm -rf * || true
	grunt build
	cd dist; git add -A

deploy:
	cd dist; git commit -m "update"; git push
