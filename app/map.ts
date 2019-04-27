import $ from './util';
import Layers from './layers';
import * as L from 'leaflet';
import DropMarker from './drop-marker';
import InitialLocation from './initial-location';
import RecommendLayers from './recommend-layers';
import Router from './router';
import Routing from './routing';
import ShowPosition from './show-position';
import Search from './search';
import StateStore from './state-store';
import Settings from './settings';
import Tracks from './tracks';

// The default Icon.Default is incompatible with the AssetGraph build
// due to rewritten urls
L.Marker.prototype.options.icon = L.icon({
  iconUrl: '/node_modules/leaflet/dist/images/marker-icon.png'.toString('url'),
  iconRetinaUrl: '/node_modules/leaflet/dist/images/marker-icon-2x.png'.toString('url'),
  shadowUrl: '/node_modules/leaflet/dist/images/marker-shadow.png'.toString('url'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

var plugins = [
  InitialLocation,
  RecommendLayers,
  DropMarker,
  ShowPosition,
  Settings,
  Search,
  Tracks,
  Router,
  Routing
];

var stateEvents = 'moveend zoomend layeradd layerremove';

// Neither geographically nor politically correct ;)
var europeBounds = [
  [35, -15], // sw
  [65, 35] // ne
];

var MapButton = L.Control.extend({
  onAdd() {
    var button = document.createElement('button');
    $.fastClick(button);
    button.className = this.options.className + '-button';
    button.type = 'button';
    button.addEventListener('click', this.options.handler, false);
    return button;
  }
});

export default class Map {
  options: StateStore
  plugins: any[]
  map?: L.Map
  layers: string[]

  defaults = {
    bounds: europeBounds,
    layers: ['mapboxstreets'],
    routingService: 'mapbox'
  }

  constructor() {
    this.options = new StateStore();

    this.validateLayers();

    // initialize plugins sequentially and
    // asynchronously, collect them in this.plugins
    this.plugins = [];
    chain(plugins.map(function(Plugin) {
      return function() {
        var plugin = new Plugin(this, this.options);
        this.plugins.push(plugin);
        return plugin.promise;
      }.bind(this);
    }, this))

    // continue initializing when the last one is done
      .then(this.pluginsInitialized.bind(this));
  }

  private pluginsInitialized() {
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
  }

  private saveState() {
    this.options.set(this.getState());
    this.options.save();
  }

  private setState(state) {
    if (state.layers) {
      this.setLayers(state.layers);
    }
    if (state.center && state.zoom !== undefined) {
      this.map.setView(state.center, state.zoom /*FIXME , true*/);
    } else if (state.bounds) {
      this.map.fitBounds(state.bounds);
    }
  }

  private getState() {
    var state = {
      zoom: this.map.getZoom(),
      center: this.map.getCenter(),
      layers: this.layers
    };
    return state;
  }

  setLayers(layers: string[]) {
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

  }

  addMarker(position: L.LatLngExpression, options?: L.MarkerOptions) {
    return L.marker(position, options).addTo(this.map);
  }

  removeMarker(marker) {
    this.map.removeLayer(marker);
  }

  createButton(className, position, handler, context) {
    var button = new (<any>MapButton)({
      className: 'map-button ' + className,
      position: position,
      handler: handler.bind(context || this),
      context: context
    });
    this.map.addControl(button);
    L.DomEvent.disableClickPropagation(button.getContainer());
    return button;
  }

  private validateLayers() {
    // Remove layers from config if they no longer exist
    var layers = this.options.get('layers');
    if (layers) {
      var validLayers = Layers.keys().map(function(layer) { return layer.id; });
      layers = layers.map(function(layer, i) {
        if (validLayers.indexOf(layer) === -1) {
          return this.defaults.layers[i];
        } else {
          return layer;
        }
      }, this);
      this.options.set('layers', layers);
    }
  }
}

function chain(functions: (() => Promise<void>)[]) {
  return functions.reduce(function(prev, fn) {
    return prev.then(fn);
  }, Promise.resolve());
}
