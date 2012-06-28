(function(exports) {

var proxy = 'http://salomvary.no.de:12354?',
	db,
	tileBounds = {};

exports.initialize = function(dbName) {
	db = openDatabase(dbName, '', dbName, 50 * 1024 * 1024);
	return getTileBounds();
};

exports.extend = function(mapType) {
	// create a "patched" maptype based on the original
	// with offline ability
	var offlineType = {
		getTile: function(coord, zoom, ownerDocument) {
			if(isOffline(coord, zoom)) {
				var div = ownerDocument.createElement('div');
				div.className = 'offline';
				div.style.width = this.tileSize.width + 'px';
				div.style.height = this.tileSize.width + 'px';
				readQuery(db, 'SELECT type, data FROM tiles WHERE ' +
						'x=? AND y=? AND zoom=?', [coord.x, coord.y, zoom])
					.then(function(data) {
						if(data.rows.length === 1) {
							var row = data.rows.item(0);
							div.style.backgroundImage = 'url(data:' + row.type +
								';base64,' + row.data + ')'; 
						} else {
							throw new Error('tile not found ' + coord + ' ' + zoom);
						}
					},
					function(err) {
						div.innerHTML = 'Read error';
						throw new Error('SQL read error ' + coord + ' ' + zoom);
					});
				return div;
			} else {
				return mapType.getTile.call(this, coord, zoom, ownerDocument);
			}
		}
	};

	['tileSize', 'maxZoom', 'minZoom', 'name'].forEach(function(prop) {
		offlineType[prop] = mapType[prop];
	});
	
	return offlineType;
};

exports.getTiles = function(map, mapType, bounds, minZoom, maxZoom) {
	var promise = Promise(),
		tiles = listTiles(map, mapType, bounds, minZoom, maxZoom),
		count = tiles.length, 
		inProgress = 0, 
		concurrency = 4 * 4, 
		abort = false;

	tileBounds = {};
	exports.hasTiles = false;

	createTable(db)
		.then(deleteAll)
		.then(next, error);

	return promise;

	function next() {
		while(inProgress < concurrency && tiles.length) {
			inProgress++;
			get(mapType, tiles.shift())
				.then(insert.bind(null, db))
				.then(progress, error);
		}
	}

	function progress() {
		inProgress--;
		promise.progress(count - inProgress - tiles.length, count);
		if(tiles.length) {
			next();
		} else if(! inProgress) {
			complete();
		}
	}

	function complete() {
		getTileBounds().then(function() {
			promise.resolve(db);
		});
	}

	function error() {
		abort = true;
		promise.reject();
	}

};

var listTiles = exports.listTiles = function(map, mapType, bounds, minZoom, maxZoom) {
	var ne = map.getProjection().fromLatLngToPoint(bounds.getNorthEast()),
		sw = map.getProjection().fromLatLngToPoint(bounds.getSouthWest()),
		tiles = [];

	for(var zoom = minZoom; zoom <= maxZoom; zoom++) {
		var resolution = Math.pow(2, zoom);
		var neTile = {
			x: Math.floor(ne.x * resolution / mapType.tileSize.width),
			y: Math.floor(ne.y * resolution / mapType.tileSize.height)
		};
		var swTile = {
			x: Math.floor(sw.x * resolution / mapType.tileSize.width),
			y: Math.floor(sw.y * resolution / mapType.tileSize.height)
		};

		for(var x = swTile.x; x <= neTile.x; x++) {
			for(var y = neTile.y; y<= swTile.y; y++) {
				tiles.push({x: x, y: y, zoom: zoom});
			}
		}
	}
	return tiles;
};

function getTileBounds() {
	// build a zoom -> bounds structure to be able
	// to quickly decide which tiles we have offline
	return readQuery(db, 'SELECT MIN(x) AS minX, MAX(x) AS maxX,' +
			'MIN(y) AS minY, MAX(y) AS maxY, zoom ' +
			'FROM tiles GROUP BY zoom')
		.then(function(data) {
			exports.hasTiles = !!data.rows.length;
			for(var i = 0; i < data.rows.length; i++) {
				var item = data.rows.item(i);
				tileBounds[item.zoom] = item;
			}
		});
}

function isOffline(coord, zoom) {
	return tileBounds[zoom] && 
		coord.x <= tileBounds[zoom].maxX && coord.x >= tileBounds[zoom].minX &&
		coord.y <= tileBounds[zoom].maxY && coord.y >= tileBounds[zoom].minY;
}

function get(mapType, tile) {
	var promise = Promise(),
		req = new XMLHttpRequest();
	req.overrideMimeType('text/plain; charset=x-user-defined');
	req.open("GET", proxy + encodeURIComponent(mapType.getTileUrl(tile, tile.zoom)), true);
	req.onreadystatechange = function() {
		if(this.readyState === 4) {
			if(req.status === 200) {
				tile.type = req.getResponseHeader('Content-Type');
				tile.data = encodeBase64(req.responseText);
				//tile.data = decodeBase64(req.responseText);
				promise.resolve(tile);
			} else {
				promise.reject(req.status);
			}
		}
	};
	req.send();
	return promise;
}

function createTable(db) {
	var promise = Promise();
	db.transaction(function (tr) {
		tr.executeSql('CREATE TABLE IF NOT EXISTS tiles '+
			'(x INTEGER NOT NULL, y INTEGER NOT NULL, zoom INTEGER NOT NULL, '+
			'type VARCHAR(255) NOT NULL, data BLOB)', [],
			function() { promise.resolve(db); },
			function(err) { promise.reject(err); } );
	});
	return promise;
}

function deleteAll(db) {
	var promise = Promise();
	db.transaction(function (tr) {
		tr.executeSql('DELETE FROM tiles', [],
			function() { promise.resolve(db); },
			function(err) { promise.reject(err); } );
	});
	return promise;
}

function insert(db, tile) {
	var promise = Promise();
	db.transaction(function (tr) {
		tr.executeSql('INSERT INTO tiles (x, y, zoom, type, data) VALUES (?,?,?,?,?)',
			[tile.x, tile.y, tile.zoom, tile.type, tile.data], 
			function() { promise.resolve(tr); },
			function(err) { promise.reject(err); } );
	});
	return promise;
}

function readQuery(db, query, values) {
	var promise = Promise();
	db.readTransaction(function(tr) {
		tr.executeSql(query, values || [], 
			function(tr, data) { 
				promise.resolve(data); 
			},
			function(tr, err) { promise.reject(err); } );
	});
	return promise;
}

function encodeBase64(data) {
	for (var length = data.length, binary = "", i = 0; i < length; ++i) {
		binary += String.fromCharCode(data.charCodeAt(i) & 255);
	}
	return btoa(binary);
}

})((window.offline = {}));
