module('Offline', {

	setup: function() {
		// offline database
		offline.initialize('turistautak-test');

		// map
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 9,
			center: pilis.getCenter(),
			mapTypeId: 'turistautak'
		});
		map.mapTypes.set('turistautak', turistautak.DEFAULT);
		map.fitBounds(pilis);

		// detect "map ready"
		var test = this;
		google.maps.event.addListenerOnce(map, 'idle', function() {
			if(test.onload) {
				test.onload();
			}
		});
		this.map = map;

		// fake xhr
		var server = sinon.fakeServer.create();
		server.xhr.prototype.overrideMimeType = function() {};
		var i = 0;
		var env = this;
		server.respondWith('GET', /http:\/\/salomvary\.no\.de:12354\?(.+)/, function(xhr, url) {
			if(i++ === env.failIndex) {
				xhr.respond(404, { 'Content-type': 'text/plain' }, 'error'); 
			} else {
				xhr.respond(200, { 'Content-type': 'image/png' }, reddot); 
			}
		});
		server.autoRespond = true;
		this.server = server;
	},

	teardown: function() {
		// xhr
		this.server.restore();

		// clean db
		if(window.openDatabase) {
			var db = openDatabase('turistautak-test', '', 'turistautak', 50 * 1024 * 1024);
			db.transaction(function(t) {
				//t.executeSql('DROP TABLE IF EXISTS tiles', []);
			});
		}
	}
});

test('listTiles', function() {
	var level10 = offline.listTiles(this.map, turistautak.DEFAULT, pilis, 10, 10);
	deepEqual(level10, level10Expected);
	var level10to12 = offline.listTiles(this.map, turistautak.DEFAULT, pilis, 10, 12);
	deepEqual(level10to12, level10to12Expected);
	ok(true);
});

asyncTest('getTiles', function() {
	var lastDone, progressCount = 0;
	this.onload = function() { // on map loaded
		
		offline.getTiles(this.map, turistautak.DEFAULT, pilis, 10, 12)
			.then(function(db) {
				equal(progressCount, level10to12Expected.length, 'progress call count');
				equal(lastDone, level10to12Expected.length, 'last progress done value');
				// success
				db.readTransaction(function(t) {
					t.executeSql('SELECT * FROM tiles', [], function(t, data) {
							equal(data.rows.length, level10to12Expected.length);
							for(var i = 0, row = data.rows.item(i); i<data.rows.length; i++) {
								ok(! isNaN(row.zoom), 'zoom');
								ok(! isNaN(row.x), 'x');
								ok(! isNaN(row.y), 'y');
								equal(row.type, 'image/png');
								ok(row.data.length, 'data');
							}
							start();
						}, 
						function() {
							ok(false, 'readTransaction error');
							start();
						});
				});
			},
			function() {
				ok(false, 'getTiles error');
				start();
			},
			function(done, count) {
				if(typeof lastDone !== 'undefined') {
					equal(done, lastDone + 1, 'progress done argument');	
				}
				equal(count, level10to12Expected.length, 'progress count argument');
				progressCount++;
				lastDone = done;
			});
	};
});

asyncTest('getTiles proxy', function() {
	// do _not_ use fake xhr server
	this.server.restore();
	expect(level10Expected.length * 6 + 1);
	
	this.onload = function() { // on map loaded
		offline.getTiles(this.map, turistautak.DEFAULT, pilis, 10, 10)
			.then(function(db) {
				// success
				db.readTransaction(function(t) {
					t.executeSql('SELECT * FROM tiles', [], function(t, data) {
							equal(data.rows.length, level10Expected.length);
							for(var i = 0, row = data.rows.item(i); i<data.rows.length; i++) {
								ok(! isNaN(row.zoom), 'zoom');
								ok(! isNaN(row.x), 'x');
								ok(! isNaN(row.y), 'y');
								equal(row.type, 'image/png');
								ok(row.data.length, 'data');
								ok(row.data.indexOf('PNG') !== -1);
							}
							start();
						}, 
						function() {
							ok(false, 'readTransaction error');
							start();
						});
				});
			},
			function() {
				ok(false, 'getTiles error');
				start();
			});
	};
});

asyncTest('getTiles fail', 1, function() {
	this.failIndex = 2;
	this.onload = function() { // on map loaded
		
		offline.getTiles(this.map, turistautak.DEFAULT, pilis, 10, 10)
			.then(function(db) {
				ok(false, 'getTiles success');
				start();
			},
			function() {
				ok(true, 'getTiles error');
				start();
			});
	};
});

asyncTest('offline type', function() {
	this.onload = function() { // on map loaded
		var map = this.map;
		offline.getTiles(this.map, turistautak.DEFAULT, pilis, 10, 11)
			.then(function() {
				var offlineMapType = offline.extend(turistautak.DEFAULT);
				// verify newly created offline map type
				equal(typeof offlineMapType.getTile, 'function', 'getTile');
				['tileSize', 'maxZoom', 'minZoom', 'name'].forEach(function(prop) {
					ok(offlineMapType[prop], prop);
				});

				// use offline map type
				map.mapTypes.set('offline', offlineMapType);
				map.setMapTypeId('offline');
				map.setZoom(10);

				// there's no event triggered on map in this case
				// so we will poll
				var timeout = setTimeout(function() {
					clearInterval(interval);
					ok(false, 'timeout');
					start();
				}, 5000);
				var interval = setInterval(function() {
					// count offline tiles
					var tiles = document.querySelectorAll('div.offline');
					if(tiles.length === 4) {
						clearTimeout(timeout);
						clearInterval(interval);
						// verify tiles
						for(var i=0; i<tiles.length; i++) {
							ok(getComputedStyle(tiles[i],false).backgroundImage.indexOf('base64') != -1, 'tile has base64 bg');
						}
						ok(true, 'offline tile count');
						start();
					}
				}, 100);
			}, function(err) {
				ok(false, 'error callback' + err);
				start();
			});
	};
});


// fixtures

var reddotBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUA'+
	'AAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO'+
	'9TXL0Y4OHwAAAABJRU5ErkJggg==';
var reddot = atob(reddotBase64);

var pilis = new google.maps.LatLngBounds(
	new google.maps.LatLng(
		47.61248938050852,
		18.721455581264536
	), // sw
	new google.maps.LatLng(
		47.824988216049846,
		19.1753282619286
	) // ne
);

var level10Expected = [
	{ "x": 565, "y": 356, "zoom": 10 },
	{ "x": 565, "y": 357, "zoom": 10 },
	{ "x": 566, "y": 356, "zoom": 10 },
	{ "x": 566, "y": 357, "zoom": 10 }
];

var level10to12Expected = [
	{ "x": 565, "y": 356, "zoom": 10 },
	{ "x": 565, "y": 357, "zoom": 10 },
	{ "x": 566, "y": 356, "zoom": 10 },
	{ "x": 566, "y": 357, "zoom": 10 },
	{ "x": 1130, "y": 713, "zoom": 11 },
	{ "x": 1130, "y": 714, "zoom": 11 },
	{ "x": 1130, "y": 715, "zoom": 11 },
	{ "x": 1131, "y": 713, "zoom": 11 },
	{ "x": 1131, "y": 714, "zoom": 11 },
	{ "x": 1131, "y": 715, "zoom": 11 },
	{ "x": 1132, "y": 713, "zoom": 11 },
	{ "x": 1132, "y": 714, "zoom": 11 },
	{ "x": 1132, "y": 715, "zoom": 11 },
	{ "x": 1133, "y": 713, "zoom": 11 },
	{ "x": 1133, "y": 714, "zoom": 11 },
	{ "x": 1133, "y": 715, "zoom": 11 },
	{ "x": 2261, "y": 1426, "zoom": 12 },
	{ "x": 2261, "y": 1427, "zoom": 12 },
	{ "x": 2261, "y": 1428, "zoom": 12 },
	{ "x": 2261, "y": 1429, "zoom": 12 },
	{ "x": 2261, "y": 1430, "zoom": 12 },
	{ "x": 2262, "y": 1426, "zoom": 12 },
	{ "x": 2262, "y": 1427, "zoom": 12 },
	{ "x": 2262, "y": 1428, "zoom": 12 },
	{ "x": 2262, "y": 1429, "zoom": 12 },
	{ "x": 2262, "y": 1430, "zoom": 12 },
	{ "x": 2263, "y": 1426, "zoom": 12 },
	{ "x": 2263, "y": 1427, "zoom": 12 },
	{ "x": 2263, "y": 1428, "zoom": 12 },
	{ "x": 2263, "y": 1429, "zoom": 12 },
	{ "x": 2263, "y": 1430, "zoom": 12 },
	{ "x": 2264, "y": 1426, "zoom": 12 },
	{ "x": 2264, "y": 1427, "zoom": 12 },
	{ "x": 2264, "y": 1428, "zoom": 12 },
	{ "x": 2264, "y": 1429, "zoom": 12 },
	{ "x": 2264, "y": 1430, "zoom": 12 },
	{ "x": 2265, "y": 1426, "zoom": 12 },
	{ "x": 2265, "y": 1427, "zoom": 12 },
	{ "x": 2265, "y": 1428, "zoom": 12 },
	{ "x": 2265, "y": 1429, "zoom": 12 },
	{ "x": 2265, "y": 1430, "zoom": 12 },
	{ "x": 2266, "y": 1426, "zoom": 12 },
	{ "x": 2266, "y": 1427, "zoom": 12 },
	{ "x": 2266, "y": 1428, "zoom": 12 },
	{ "x": 2266, "y": 1429, "zoom": 12 },
	{ "x": 2266, "y": 1430, "zoom": 12 }
];
