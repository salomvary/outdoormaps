var L = require('vendor/leaflet'),
    $ = require('util'),
    flags = require('flags'),
    Panoramio = require('panoramio'),
    Flickr = require('flickr');
    require('vendor/bing-layer');
    require('vendor/OS');

var layers = {}, instances = {},
    customOptions = ['title', 'klazz', 'mapType'];

var Hungary = new L.LatLngBounds(
  new L.LatLng(48.6, 16),    // sw
  new L.LatLng(45.6, 23.2)); // ne

layers.map = {
  url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: 'Map data © OpenStreetMap contributors',
  detectRetina: flags.isEnabled('detectRetina'),
  mapType: 'map'
};

layers.opencyclemap = {
  url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
  subdomains: 'abc',
  attribution: 'Map data © OpenStreetMap contributors',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'OpenCycleMap',
  mapType: 'hiking'
};

layers.wanderkarte = {
  url: 'http://{s}.wanderreitkarte.de/topo/{z}/{x}/{y}.png',
  subdomains: ['topo', 'topo2', 'topo3', 'topo4'],
  minZoom: 5,
  maxZoom: 18,
  attribution: '<a href="http://wanderreitkarte.de">Wanderkarte (Nop)</a>',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'Wanderkarte (Central Europe)',
  mapType: 'hiking',
  bounds: new L.LatLngBounds(
    new L.LatLng(27.4, -32),
    new L.LatLng(58, 23))
};

layers.turistautak = {
  url: 'http://{s}.map.turistautak.hu/tiles/turistautak/{z}/{x}/{y}.png',
  minZoom: 8,
  maxZoom: 21,
  subdomains: 'abcd',
  attribution: '© <a href="http://turistautak.hu">Turistautak.hu</a>',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'Turistautak.hu (Hungary)',
  mapType: 'hiking',
  bounds: Hungary
};

layers.satellite = {
  klazz: L.BingLayer,
  url: 'AugCQhyydetxyavzoAQjcWuElUpYz2r49p15Kol7MUZEHnAW9umPiQWiki5CsUuz',
  detectRetina: true,
  mapType: 'satellite'
};

layers.bergfex = {
  url: 'http://static1.bergfex.at/images/amap/{z}/{folder}{z}_{x}_{y}.png',
  minZoom: 8,
  maxZoom: 15,
  attribution: '© <a href="http://bergfex.com">bergfex.com</a>',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'bergfex (Austria)',
  mapType: 'hiking',
  folder: function(data) {
    // credits:
    // http://svn.openlayers.org/sandbox/ahocevar/bergfex/index.html
    return data.z >= 14
      ? String(data.x).slice(0, -2) + '/'
      : '';
  },
  bounds: new L.LatLngBounds(
    new L.LatLng(46.3, 9.3), // sw
    new L.LatLng(49, 17.3))  // ne
};

layers.bgtopovj = {
  klazz: L.TileLayer.WMS,
  detectRetina: flags.isEnabled('detectRetina'),
  attribution: '<a href="http://web.uni-plovdiv.bg/vedrin/index_en.html">Map data: Uni-Plovdiv</a>',
  url: 'http://www.kade.si/cgi-bin/mapserv',
  layers: 'BGtopoVJ-raster-v3.00',
  title: 'BGtopoVJ (Bulgaria)',
  mapType: 'hiking',
  bounds: new L.LatLngBounds(
    new L.LatLng(40, 20), // sw
    new L.LatLng(44, 29)) // ne
};

layers.panoramio = {
  klazz: Panoramio,
  title: 'Panoramio',
  mapType: 'overlay'
};

layers.flickr = {
  klazz: Flickr,
  title: 'Flickr',
  mapType: 'overlay'
};

layers.strava = {
  url: 'http://globalheat.strava.com/tiles/cycling/color1/{z}/{x}/{y}.png',
  attribution: '© <a href="http://labs.strava.com/heatmap">Strava</a>',
  detectRetina: true,
  title: 'Strava Heatmap',
  mapType: 'overlay',
  maxNativeZoom: 15,
  maxZoom: 21
};

layers.forumaps = {
  url: 'http://tileserver.4umaps.eu/{z}/{x}/{y}.png',
  maxZoom: 15,
  attribution: '© <a href="http://www.4umaps.eu/">4UMaps.eu</a>',
  title: '4UMaps.eu',
  mapType: 'hiking'
};

layers.lines = {
  url: 'http://{s}.map.turistautak.hu/tiles/lines/{z}/{x}/{y}.png',
  minZoom: 8,
  maxZoom: 21,
  subdomains: 'abcd',
  attribution: '© <a href="http://turistautak.hu">Turistautak.hu</a>',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'Turistautak.hu',
  mapType: 'overlay',
  bounds: Hungary
};

layers.ordnancesurvey = {
	klazz: L.TileLayer.WMS.OS,
	url: {k: '2ADBD707AC40153AE0530B6CA40A381E'},
	mapType: 'hiking',
	title: 'Ordnance Survey (UK)'
};

layers.opentopomap = {
  url: 'http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  maxZoom: 15,
  subdomains: 'abc',
  attribution: '© <a href="http://opentopomap.org/">OpenTopoMap</a>',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'OpenTopoMap (Europe)',
  mapType: 'hiking'
};

Object.keys(layers).forEach(function(id) {
  layers[id].id = id;
});

var getLeafletOptions = filterOptions.bind(null, false);
var getCustomOptions = filterOptions.bind(null, true);

exports.get = function(id) {
  // lazy-load this to avoid initial metadata request if not used
  // (eg. L.BingLayer)
  if (!instances[id] && id in layers) {
    var Layer = layers[id].klazz || L.TileLayer;
    instances[id] = new Layer(layers[id].url, getLeafletOptions(layers[id]));
    // set custop properties after instantiating layers
    // so that they don't interfere with constructors
    // (eg. are not included in wms options)
    $.extend(instances[id], getCustomOptions(layers[id]));
  }
  return instances[id];
};

exports.keys = function(mapType) {
  return Object.keys(layers)
    .map(function(key) {
      return layers[key];
    })
    .filter(function(layer) {
      return !mapType || layer.mapType === mapType;
    });
};

function filterOptions(isCustom, options) {
  return Object.keys(options)
    .reduce(function(filtered, key) {
      if ((customOptions.indexOf(key) !== -1) === isCustom) {
        filtered[key] = options[key];
      }
      return filtered;
    }, {});
}
