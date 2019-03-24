release:
	cd dist; git clean -f; git rm -rf * || true
	npm run build
	cp CNAME dist
	cd dist; git add -A

deploy:
	cd dist; git commit -m "update"; git push

clean:
	rm -r dist/*
