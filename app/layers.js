var L = require('vendor/leaflet'),
		flags = require('flags');
		require('vendor/bing-layer');

var layers = {};

layers.map = new L.TileLayer(
	'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data © OpenStreetMap contributors',
	detectRetina: flags.isEnabled('detectRetina')
});

layers.turistautak = new L.TileLayer(
	'http://{s}.map.turistautak.hu/tiles/{type}/{z}/{x}/{y}.png', {
	type: 'turistautak',
	minZoom: 8,
	maxZoom: 21,
	subdomains: 'abcd',
	attribution: '© <a href="http://turistautak.hu">Turistautak.hu</a>',
	detectRetina: flags.isEnabled('detectRetina')
});

layers.lines = new L.TileLayer(
	'http://{s}.map.turistautak.hu/tiles/{type}/{z}/{x}/{y}.png', {
	type: 'lines',
	minZoom: 8,
	maxZoom: 21,
	subdomains: 'abcd',
	attribution: '© <a href="http://turistautak.hu">Turistautak.hu</a>',
	detectRetina: flags.isEnabled('detectRetina')
});

layers.wanderkarte = new L.TileLayer(
	'http://www.wanderreitkarte.de/topo/{z}/{x}/{y}.png', {
	minZoom: 5,
	maxZoom: 18,
	attribution: '<a href="http://wanderreitkarte.de">Wanderkarte (Nop)</a>',
	detectRetina: flags.isEnabled('detectRetina')
});

exports.get = function(id) {
	if(id === 'satellite' && ! layers[id]) {
		// lazy-load this to avoid initial metadata request if not used
		layers.satellite = new L.BingLayer(
			'AugCQhyydetxyavzoAQjcWuElUpYz2r49p15Kol7MUZEHnAW9umPiQWiki5CsUuz',
			{detectRetina: flags.isEnabled('detectRetina')});
	}
	return layers[id];
};
