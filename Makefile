release:
	cd dist; git clean -f; git rm -rf * || true
	npm run -- grunt build
	cd dist; git add -A

deploy:
	cd dist; git commit -m "update"; git push
