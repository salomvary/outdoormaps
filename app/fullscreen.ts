import * as L from 'leaflet';
import { MapPlugin } from './map-plugin';
import Map from './map';
import StateStore from './state-store';
import 'leaflet-fullscreen';

export default class Fullscreen implements MapPlugin {
  private controller: Map
  private options: StateStore

  constructor(controller: Map, options: StateStore) {
    this.controller = controller;
    this.options = options;
  }

  setMap(map: L.Map) {
    map.addControl(new L.Control.Fullscreen());
  }
}
