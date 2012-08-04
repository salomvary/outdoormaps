(function(exports){

var layers = {};
	detectRetina: isEnabled('detectRetina')

layers.map = new L.TileLayer(
	'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data © OpenStreetMap contributors',
	detectRetina: isEnabled('detectRetina')
});	

layers.turistautak = new L.TileLayer(
	'http://{s}.map.turistautak.hu/tiles/{type}/{z}/{x}/{y}.png', {
	type: 'turistautak',
	minZoom: 8,
	maxZoom: 21,
	subdomains: 'abcd',
	attribution: '© Turistautak.hu',
	detectRetina: isEnabled('detectRetina')
});

layers.lines = new L.TileLayer(
	'http://{s}.map.turistautak.hu/tiles/{type}/{z}/{x}/{y}.png', {
	type: 'lines',
	minZoom: 8,
	maxZoom: 21,
	subdomains: 'abcd',
	attribution: '© Turistautak.hu',
	detectRetina: isEnabled('detectRetina')
});

exports.get = function(id) {
	if(id === 'satellite' && ! layers[id]) {
		// lazy-load this to avoid initial metadata request if not used
		layers.satellite = new L.BingLayer(
			'AugCQhyydetxyavzoAQjcWuElUpYz2r49p15Kol7MUZEHnAW9umPiQWiki5CsUuz',
			{detectRetina: isEnabled('detectRetina')});
	}
	return layers[id];
};

})(window.layers = {});
