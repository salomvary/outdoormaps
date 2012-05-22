/**
 * Turistautak.hu map types for Google Maps
 */

var turistautak = {};

turistautak.getTileUrl = function(type, coord, zoom) {
	// a-b-c-d subdomain sharding
	var subdomain = String.fromCharCode(97 /* 'a' */ + (zoom + coord.x + coord.y) % 4);
	return 'http://' + subdomain + '.map.turistautak.hu/tiles/' + type + '/' + zoom +
		'/' + coord.x + '/' + coord.y + '.png';
};

turistautak.defaultOptions = function() {};
turistautak.defaultOptions.prototype = {
	getTileUrl: function(coord, zoom) {
		return turistautak.getTileUrl('turistautak', coord, zoom);
  },
  tileSize: new google.maps.Size(256, 256),
  maxZoom: 21,
  minZoom: 8,
	name: 'Turista'
};

turistautak.linesOptions = function(){};
turistautak.linesOptions.prototype = new turistautak.defaultOptions();

turistautak.linesOptions.prototype.getTileUrl = function(coord, zoom) {
		return turistautak.getTileUrl('lines', coord, zoom);
};

turistautak.DEFAULT = new google.maps.ImageMapType(new turistautak.defaultOptions());
turistautak.LINES = new google.maps.ImageMapType(new turistautak.linesOptions());
