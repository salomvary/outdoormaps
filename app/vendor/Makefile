CURL=curl -s -S -L

DEPENDENCIES=bing-layer.js\
						 leaflet\
						 add-to-homescreen\
						 require.js\
						 klass.js\
						 mocha\
						 chai\
						 sinon.js\
						 sinon-chai.js\
						 jsonp.js\
						 GPX.js\
						 fastclick.js

all: $(DEPENDENCIES)

clean:
	rm -rf $(DEPENDENCIES)

# zip file hosted somewhere on the internetz

#leaflet:
#	$(CURL) http://leaflet-cdn.s3.amazonaws.com/build/leaflet-0.7.zip -o $@.download.zip
#	unzip -q $@.download.zip -d leaflet
#	rm $@.download.zip

leaflet: leaflet-src
	cp -r leaflet-src/dist/ $@

leaflet-src:
	mkdir -p $@
	$(CURL) https://codeload.github.com/Leaflet/Leaflet/tar.gz/v0.7.3|tar xf - --strip-components 1 -C $@
	cd $@; npm install; node_modules/.bin/jake build[lqs002d,custom]

# single github file without tag

klass.js:
	$(CURL) -o $@ https://raw.github.com/ded/klass/c33b3c8114e4243c63619772b156f480d0d8af28/klass.js

bing-layer.js:
	$(CURL) -o $@ https://raw.github.com/shramov/leaflet-plugins/44935a984e2b051131a21f23d45c373ab8362564/layer/tile/Bing.js

jsonp.js:
	$(CURL) -o $@ https://raw.github.com/larryosborn/JSONP/842ac6d454242e856af3550b07a67113cdf84e86/dist/jsonp.js

# single github file, tagged

require.js:
	$(CURL) -o $@ https://raw.github.com/jrburke/requirejs/2.1.9/require.js

GPX.js:
	$(CURL) -o $@ https://raw.githubusercontent.com/shramov/leaflet-plugins/v1.1.2/layer/vector/GPX.js

fastclick.js:
	$(CURL) -o $@ https://raw.githubusercontent.com/ftlabs/fastclick/v1.0.6/lib/fastclick.js

# plain file from the internetz

#sinon.js:
#	$(CURL) -o $@ http://sinonjs.org/releases/sinon-1.7.3.js

sinon.js: sinon-src
	cp sinon-src/pkg/$@ $@

# build of post-1.7.3 master which fixes the duplicate onload call
# (https://github.com/cjohansen/Sinon.JS/pull/320)
sinon-src:
	mkdir -p $@
	$(CURL) https://codeload.github.com/cjohansen/Sinon.JS/tar.gz/fbdfbb0f1|tar xf - --strip-components 1 -C $@
	# this version runs on ruby 1.8
	cd $@; gem install -i ./ -v 1.5.0 --no-ri --no-rdoc -V nokogiri
	cd $@; gem install -i ./ -v 1.0.0 --no-ri --no-rdoc -V -f juicer
	cd $@; GEM_PATH=. ruby -rubygems build

sinon-chai.js:
	$(CURL) -o $@ https://raw.github.com/domenic/sinon-chai/2.4.0/lib/sinon-chai.js

# GitHub releases

add-to-homescreen:
	mkdir -p $@
	$(CURL) https://codeload.github.com/cubiq/add-to-homescreen/tar.gz/2.0.11|tar xf - --strip-components 1 -C $@

mocha:
	mkdir -p $@
	$(CURL) https://codeload.github.com/visionmedia/mocha/tar.gz/1.14.0|tar xf - --strip-components 1 -C $@

chai:
	mkdir -p $@
	$(CURL) https://codeload.github.com/chaijs/chai/tar.gz/1.8.1|tar xf - --strip-components 1 -C $@
