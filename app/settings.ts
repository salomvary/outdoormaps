import Layers, { LayerMapType } from './layers';
import $ from './util';
import Select, { SelectOptions } from './select';
import ButtonGroup from './button-group';
import { MapPlugin } from './map-plugin';
import Map from './map';
import StateStore from './state-store';
import { LeafletEventHandlerFn } from 'leaflet';

export default class Settings implements MapPlugin {
  private controller: Map
  private options: StateStore
  private map: L.Map

  private mapLayer: string
  private overlay: string
  private mapType: LayerMapType
  private defaultLayers: {[mapType: string]: string}
  private mapTypeButtons: Select
  private layerButtons: { [mapType: string]: ButtonGroup }
  private overlayButtons: ButtonGroup

  constructor(controller: Map, options: StateStore) {
    this.controller = controller;
    this.options = options;

    // event handlers
    var closeButton = document.getElementById('close-button');
    $.on(closeButton, 'click', this.closeSettings, this);
    $.fastClick(closeButton);

    // initial state
    var layers = (options.get('layers') || controller.defaults.layers);
    this.mapLayer = layers[0];
    this.overlay = layers[1];
    this.mapType = Layers.get(this.mapLayer).mapType;
    this.defaultLayers = options.get('defaultLayers');
    if (!this.defaultLayers) {
      this.defaultLayers = {};
      this.defaultLayers[this.mapType] = this.mapLayer;
    }

    this.createButtons();
    this.updateButtons();
  }

  setMap(map: L.Map) {
    this.map = map;
    this.controller.createButton('layers', 'topright',
      this.toggleSettings, this);
  }

  toggleSettings() {
    var show = document.body.className !== 'settings';
    $.toggleClass(document.body, 'settings', show);
    this.map[show ? 'on' : 'off']('moveend', updateAvailableLayers, this);
    if (show) {
      updateAvailableLayers.call(this);
    }
  }

  closeSettings() {
    $.toggleClass(document.body, 'settings', false);
  }

  setMapType(event) {
    var type = event.value;
    var layerId = this.defaultLayers[type] || Layers.keys(type)[0].id;
    this.mapType = type;
    this.setLayers([layerId, this.overlay]);
  }

  setMapLayer(event) {
    var id = event.value;
    this.defaultLayers[Layers.get(id).mapType] = id;
    this.setLayers([id, this.overlay]);
  }

  setOverlay(event) {
    var id = event.value,
      add = this.overlay !== id;
    this.setLayers([this.mapLayer, add && id]);
  }

  setLayers(layerIds) {
    this.mapLayer = layerIds[0];
    this.overlay = layerIds[1];
    this.controller.setLayers(layerIds.filter(Boolean));
    this.options.set({defaultLayers: this.defaultLayers});
    this.updateButtons();
  }

  private createButtons() {
    var container = document.querySelector('.map-types');

    this.mapTypeButtons = new Select(container.querySelector('.map-type'))
      .on('change', this.setMapType, this);

    // create layer type selection for map types with multiple
    // layers
    this.layerButtons = (<LayerMapType[]>['hiking', 'satellite', 'map'])
      // only when it has more than one layer
      .filter(function(mapType) { return Layers.keys(mapType).length > 1; })
      // create button for each mapType with multiple layers
      .reduce(function(layerButtons, mapType) {
        layerButtons[mapType] = layerButtonsFor({
          mapType: mapType,
          parent: container.querySelector('.map-layers'),
          handler: this.setMapLayer.bind(this)
        });
        return layerButtons;
      }.bind(this), {});

    // overlay selection
    this.overlayButtons = layerButtonsFor({
      mapType: 'overlay',
      options: {toggle: true},
      parent: container.querySelector('.map-overlays'),
      handler: this.setOverlay.bind(this)
    });
  }

  updateButtons() {
    // set the active map type
    this.mapTypeButtons.set(this.mapType);

    // show/hide layer group
    Object.keys(this.layerButtons).forEach(function(mapType) {
      var el = this.layerButtons[mapType].el;
      if (mapType === this.mapType) {
        $.show(el);
      } else {
        $.hide(el);
      }
    }, this);

    // set the active layer
    if (this.layerButtons[this.mapType]) {
      this.layerButtons[this.mapType].set(this.mapLayer);
    }

    // set the active overlay
    this.overlayButtons.set(this.overlay);

    // XXX fix a strange Chrome issue that settings doesn't repaint
    document.getElementById('settings').style.opacity = '1';
  }
}

function layerButtonsFor(options: {
  options?: SelectOptions;
  parent: HTMLElement;
  handler: LeafletEventHandlerFn;
  mapType: LayerMapType;
}) {
  var values = layersToOptions(Layers.keys(options.mapType));
  var buttons = new ButtonGroup(Object.assign({}, options.options, {values}))
    .on('change', options.handler);
  options.parent.appendChild(buttons.el);
  return buttons;
}

function layersToOptions(layers) {
  return layers.reduce(function(options, layer) {
    options[layer.id] = layer.title;
    return options;
  }, {});
}

function updateAvailableLayers() {
  // for the active layer
  if (this.layerButtons[this.mapType]) {
    var disabledLayers = getDisabledLayers.call(this, Layers.keys(this.mapType));
    this.layerButtons[this.mapType].setDisabled(disabledLayers);
  }

  // for overlays
  var disabledOverlays = getDisabledLayers.call(this, Layers.keys('overlay'));
  this.overlayButtons.setDisabled(disabledOverlays);
}

function getDisabledLayers(layers) {
  var mapBounds = this.map.getBounds();
  return layers
    .filter(function(layer) {
      return layer.bounds && !layer.bounds.contains(mapBounds);
    })
    .map(function(layer) { return layer.id; });
}
