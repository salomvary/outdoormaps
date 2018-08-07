CURL=curl -s -S -L --fail

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
						 fastclick.js\
						 MapMultiCRS.js\
						 OS.js\
						 proj4leaflet.js\
						 proj4.js\
						 leaflet-routing-machine.css\
						 leaflet-routing-machine.js\
						 jxon.js\
						 FileSaver.js

all: $(DEPENDENCIES)

clean:
	rm -rf $(DEPENDENCIES)

# zip file hosted somewhere on the internetz

leaflet:
	$(CURL) http://cdn.leafletjs.com/leaflet/v1.0.3/leaflet.zip -o $@.download.zip
	unzip -q $@.download.zip -d leaflet
	rm $@.download.zip

#TODO bring back custom build once all dependencies are figured out
#(drawing gpx tracks is currently broken)
#leaflet: leaflet-src
#	cp -r leaflet-src/dist/ $@
#
#leaflet-src:
#	mkdir -p $@
#	$(CURL) https://github.com/Leaflet/Leaflet/archive/v1.0.1.tar.gz|tar xf - --strip-components 1 -C $@
#	cd $@ && npm install && node_modules/.bin/jake build[dqs0fet,custom]

# single github file without tag

klass.js:
	$(CURL) -o $@ https://raw.github.com/ded/klass/c33b3c8114e4243c63619772b156f480d0d8af28/klass.js

bing-layer.js:
	$(CURL) -o $@ https://raw.github.com/shramov/leaflet-plugins/44935a984e2b051131a21f23d45c373ab8362564/layer/tile/Bing.js

jsonp.js:
	$(CURL) -o $@ https://raw.github.com/larryosborn/JSONP/842ac6d454242e856af3550b07a67113cdf84e86/dist/jsonp.js

MapMultiCRS.js:
	$(CURL) -o $@ https://raw.githubusercontent.com/Dominique92/Leaflet.Map.MultiVendors/cf0b011e7caeb484771478b428d7c740672a46f6/MapMultiCRS.js

OS.js:
	$(CURL) -o $@ https://raw.githubusercontent.com/Dominique92/Leaflet.Map.MultiVendors/cf0b011e7caeb484771478b428d7c740672a46f6/layers-v1.0/OS.js

# Required by OS
proj4leaflet.js:
	$(CURL) -o $@ https://raw.githubusercontent.com/kartena/Proj4Leaflet/ba1a2c582c71c668b6b658a2ae91da803bfbf940/src/proj4leaflet.js

# Required by OS
proj4.js:
	$(CURL) -o $@ https://raw.githubusercontent.com/proj4js/proj4js/2.3.12/dist/proj4-src.js

# single github file, tagged

require.js:
	$(CURL) -o $@ https://raw.github.com/jrburke/requirejs/2.3.5/require.js

GPX.js:
	$(CURL) -o $@ https://raw.githubusercontent.com/shramov/leaflet-plugins/1.1.2/layer/vector/GPX.js

fastclick.js:
	$(CURL) -o $@ https://raw.githubusercontent.com/ftlabs/fastclick/v1.0.6/lib/fastclick.js

jxon.js:
	$(CURL) -o $@ https://raw.githubusercontent.com/tyrasd/jxon/1.6.1/index.js

# plain file from the internetz

sinon.js:
	$(CURL) -o $@ http://sinonjs.org/releases/sinon-1.17.2.js

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

leaflet-routing-machine.css:
	$(CURL) -o $@ https://unpkg.com/leaflet-routing-machine@3.2.7/dist/leaflet-routing-machine.css

leaflet-routing-machine.js:
	$(CURL) -o $@ https://unpkg.com/leaflet-routing-machine@3.2.7/dist/leaflet-routing-machine.js

FileSaver.js:
	$(CURL) -o $@ https://unpkg.com/file-saver@1.3.8/FileSaver.js
