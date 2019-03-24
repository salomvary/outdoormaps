var L = require('vendor/leaflet'),
    $ = require('util'),
    flags = require('flags'),
    Flickr = require('flickr');
    require('vendor/bing-layer');
    require('vendor/OS');

var mapboxKey = 'pk.eyJ1Ijoic2Fsb212YXJ5IiwiYSI6ImNpcWI1Z21lajAwMDNpMm5oOGE4ZzFzM3YifQ.DqyC3wn8ChEjcztfbY0l_g';

var layers = {}, instances = {},
    customOptions = ['title', 'klazz', 'mapType'];

var Hungary = new L.LatLngBounds(
  new L.LatLng(48.6, 16),    // sw
  new L.LatLng(45.6, 23.2)); // ne

layers.mapboxstreets = {
  url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}@2x?access_token=' + mapboxKey,
  attribution: '© Mapbox',
  title: 'Mapbox Streets',
  mapType: 'map'
};

layers.map = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: 'Map data © OpenStreetMap contributors',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'OpenStreetMap',
  mapType: 'map'
};

layers.mapboxoutdoors = {
  url: 'https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}@2x.png?access_token=' + mapboxKey,
  attribution: '© Mapbox',
  title: 'Mapbox Outdoors',
  mapType: 'hiking'
};

layers.opencyclemap = {
  url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}@2x.png?apikey=0050a9bf53204806a4a9af0a4c5e03f7',
  subdomains: 'abc',
  attribution: 'Map data © OpenStreetMap contributors',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'OpenCycleMap',
  mapType: 'hiking'
};

layers.wanderkarte = {
  url: 'https://{s}.wanderreitkarte.de/topo/{z}/{x}/{y}.png',
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
  url: 'https://{s}.map.turistautak.hu/tiles/turistautak/{z}/{x}/{y}.png',
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
  url: 'https://maps.bergfex.at/oek/{folder}/{z}/{x}/{y}.jpg',
  minZoom: 4,
  maxZoom: 16,
  attribution: '© <a href="http://bergfex.com">bergfex.com</a>',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'bergfex (Austria)',
  mapType: 'hiking',
  folder: function(data) {
    return data.z <= 15 ? '512px' : 'standard';
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

layers.flickr = {
  klazz: Flickr,
  title: 'Flickr',
  mapType: 'overlay'
};

layers.forumaps = {
  url: 'https://tileserver.4umaps.com/{z}/{x}/{y}.png',
  maxZoom: 15,
  attribution: '© <a href="http://www.4umaps.eu/">4UMaps.eu</a>',
  title: '4UMaps.eu',
  mapType: 'hiking'
};

layers.lines = {
  url: 'https://{s}.map.turistautak.hu/tiles/lines/{z}/{x}/{y}.png',
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
  url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  maxZoom: 15,
  subdomains: 'abc',
  attribution: '© <a href="http://opentopomap.org/">OpenTopoMap</a>',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'OpenTopoMap (Europe)',
  mapType: 'hiking'
};

layers.opensnowmapBase = {
  url: 'https://www.opensnowmap.org/base_snow_map/{z}/{x}/{y}.png',
  maxZoom: 18,
  attribution: '© <a href="http://opensnowmap.org">opensnowmap.org</a> CC-BY-SA',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'OpenSnowMap (Base)',
  mapType: 'hiking'
};

layers.opensnowmapPiste = {
  url: 'http://www.opensnowmap.org/tiles-pistes/{z}/{x}/{y}.png',
  maxZoom: 18,
  attribution: '© <a href="http://opensnowmap.org">opensnowmap.org</a> CC-BY-SA',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'OpenSnowMap (Piste)',
  mapType: 'overlay'

};

// Source:
// http://icgc.cat/Administracio-i-empresa/Serveis/Geoinformacio-en-linia-Geoserveis/Serveis-per-a-API-i-Widgets/API-de-Leaflet
layers.catalonia = {
  klazz: L.TileLayer.WMS,
  url: 'http://mapcache.icc.cat/map/bases/service?',
  format: 'image/jpeg',
  layers: 'topo',
  crs: new L.Proj.CRS(
    'EPSG:25831',
      '+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        { resolutions: [1100, 550, 275, 100, 50, 25, 10, 5, 2, 1, 0.5, 0.25] }
  ),
  continuousWorld: true,
  attribution: 'Institut Cartogràfic i Geològic de Catalunya -ICGC',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'ICGC Catalonia (Spain)',
  mapType: 'hiking',
  bounds: new L.LatLngBounds(
    new L.LatLng(42.9, 0.04),
    new L.LatLng(40.52, 3.41))
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
