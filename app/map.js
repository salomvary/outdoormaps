var klass = require('vendor/klass'),
    Promise = require('promise'),
    Layers = require('layers'),
    L = require('vendor/leaflet'),
    DropMarker = require('drop-marker'),
    InitialLocation = require('initial-location'),
    RecommendLayers = require('recommend-layers'),
    ShowPosition = require('show-position'),
    StateStore = require('state-store'),
    Settings = require('settings');

L.Icon.Default.imagePath = 'vendor/leaflet.js/images';

var plugins = [
  InitialLocation,
  RecommendLayers,
  DropMarker,
  ShowPosition,
  Settings
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
      if(plugin.setMap) {
        plugin.setMap(this.map);
      }
    }, this);

    // add zoom-control for non-pinch-zoom devices
    if(! /(iPhone|iPod|iPad).*AppleWebKit/i.test(navigator.userAgent)) {
      map.addControl(L.control.zoom());
    }

    // set options
    var defaults = {};
    Object.keys(this.defaults).forEach(function(k) {
      if(typeof this.options.get(k) == 'undefined') {
        defaults[k] = this.defaults[k];
      }
    }, this);
    this.options.set(defaults);
    this.setState(this.options.get());

    map.on(stateEvents, this.saveState, this);
  },

  saveState: function() {
    console.log('saveState', this.getState());
    this.options.set(this.getState());
    this.options.save();
  },

  setState: function(state) {
    if(state.layers) {
      this.setLayers(state.layers);
    }
    if(state.center && state.zoom !== undefined) {
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

    if(oldLayers) {
      oldLayers.forEach(function(layer) {
        this.map.removeLayer(Layers.get(layer));
      }, this);
    }

    layers.forEach(function(layer) {
      this.map.addLayer(Layers.get(layer));
    }, this);

  },

  addMarker: function(position) {
    return L.marker(position).addTo(this.map);
  },

  createButton: function(className, position, handler, context) {
    this.map.addControl(new MapButton({
      className: className,
      position: position,
      handler: handler.bind(context || this),
      context: context
    }));
  }
});

var MapButton = L.Control.extend({
  onAdd: function() {
    var button = document.createElement('button');
    button.className = this.options.className + '-button';
    button.type = 'button';
    button.addEventListener('click', this.options.handler, false);
    return button;
  }
});
