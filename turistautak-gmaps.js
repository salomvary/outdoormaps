/**
 * Turistautak.hu map types for Google Maps
 */
(function(exports, maps) {

function getTileUrl(type, coord, zoom) {
	// a-b-c-d subdomain sharding
	var subdomain = String.fromCharCode(97 /* 'a' */ + (zoom + coord.x + coord.y) % 4);
	return 'http://' + subdomain + '.map.turistautak.hu/tiles/' + type + '/' + zoom +
		'/' + coord.x + '/' + coord.y + '.png';
}

function extend(base, properties) {
	var type = function() {
		base.call(this, this);
	};
	type.prototype = Object.create(base.prototype);
	for(var name in properties) {
		type.prototype[name] = properties[name];
	}
	type.prototype.extend = type.extend = function(properties) {
		return extend(type, properties);
	};
	return type;
}

var Default = extend(maps.ImageMapType, {
	getTileUrl: function(coord, zoom) {
		return getTileUrl('turistautak', coord, zoom);
  },
  tileSize: new maps.Size(256, 256),
  maxZoom: 21,
  minZoom: 8,
	name: 'Turista'
});

var Lines = Default.extend({
	getTileUrl: function(coord, zoom) {
		return getTileUrl('lines', coord, zoom);
	}
});

exports.DEFAULT = new Default();
exports.LINES = new Lines();

})((window.turistautak = {}), google.maps);
