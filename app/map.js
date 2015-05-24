var $ = require('util'),
    klass = require('vendor/klass'),
    Promise = require('promise'),
    Layers = require('layers'),
    L = require('vendor/leaflet'),
    DropMarker = require('drop-marker'),
    InitialLocation = require('initial-location'),
    RecommendLayers = require('recommend-layers'),
    Router = require('router'),
    ShowPosition = require('show-position'),
    Search = require('search'),
    StateStore = require('state-store'),
    Settings = require('settings'),
    Tracks = require('tracks');

L.Icon.Default.imagePath = 'vendor/leaflet/images';

var plugins = [
  InitialLocation,
  RecommendLayers,
  DropMarker,
  ShowPosition,
  Settings,
  Search,
  Tracks,
  Router
];

var stateEvents = 'moveend zoomend layeradd layerremove';

module.exports = klass({
  defaults: {
    center: new L.LatLng(47.3, 19.5),
    zoom: 8,
    layers: ['turistautak']
  },

  initialize: function() {
    this.options = new StateStore();

    // initialize plugins sequentially and
    // asynchronously, collect them in this.plugins
    this.plugins = [];
    Promise.chain(plugins.map(function(Plugin) {
      return function() {
        var plugin = new Plugin(this, this.options);
        this.plugins.push(plugin);
        return plugin.promise;
      }.bind(this);
    }, this))

    // continue initializing when the last one is done
    .then(this.pluginsInitialized.bind(this));
  },

  pluginsInitialized: function() {
    // create map
    var map = this.map = new L.Map('map', {
      zoomControl: false
    });
    map.addControl(L.control.scale({imperial: false}));
    map.getContainer().focus();

    // tell plugins about the map instance
    this.plugins.forEach(function(plugin) {
      if (plugin.setMap) {
        plugin.setMap(this.map);
      }
    }, this);

    // add zoom-control for non-pinch-zoom devices
    if (!/(iPhone|iPod|iPad).*AppleWebKit/i.test(navigator.userAgent)) {
      map.addControl(L.control.zoom());
    }

    // set options
    var defaults = {};
    Object.keys(this.defaults).forEach(function(k) {
      if (typeof this.options.get(k) == 'undefined') {
        defaults[k] = this.defaults[k];
      }
    }, this);
    this.options.set(defaults);
    this.setState(this.options.get());

    map.on(stateEvents, this.saveState, this);
  },

  saveState: function() {
    this.options.set(this.getState());
    this.options.save();
  },

  setState: function(state) {
    if (state.layers) {
      this.setLayers(state.layers);
    }
    if (state.center && state.zoom !== undefined) {
      this.map.setView(state.center, state.zoom, true);
    }
  },

  getState: function() {
    var state = {
      zoom: this.map.getZoom(),
      center: this.map.getCenter(),
      layers: this.layers
    };
    return state;
  },

  setLayers: function(layers) {
    var oldLayers = this.layers;
    this.layers = layers;

    if (oldLayers) {
      oldLayers.forEach(function(layer) {
        this.map.removeLayer(Layers.get(layer));
      }, this);
    }

    layers.forEach(function(layer) {
      this.map.addLayer(Layers.get(layer));
    }, this);

  },

  addMarker: function(position, options) {
    return L.marker(position, options).addTo(this.map);
  },

  removeMarker: function(marker) {
    this.map.removeLayer(marker);
  },

  createButton: function(className, position, handler, context) {
    var button = new MapButton({
      className: 'map-button ' + className,
      position: position,
      handler: handler.bind(context || this),
      context: context
    });
    this.map.addControl(button);
    L.DomEvent.disableClickPropagation(button.getContainer());
    return button;
  }
});

var MapButton = L.Control.extend({
  onAdd: function() {
    var button = document.createElement('button');
    $.fastClick(button);
    button.className = this.options.className + '-button';
    button.type = 'button';
    button.addEventListener('click', this.options.handler, false);
    return button;
  }
});
