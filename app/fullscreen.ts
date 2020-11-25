import * as L from 'leaflet';
import { MapPlugin } from './map-plugin';
import Map from './map';
import StateStore from './state-store';
import 'leaflet-fullscreen';

export default class Fullscreen implements MapPlugin {
  private controller: Map;
  private options: StateStore;
  private fullscreen: L.Control.Fullscreen;

  constructor(controller: Map, options: StateStore) {
    if ((<any>navigator).standalone) {
      return;
    }
    this.controller = controller;
    this.options = options;
    this.fullscreen = new L.Control.Fullscreen({
      title: {
        false: 'View Fullscreen (press f)',
        true: 'Exit Fullscreen (press f)',
      },
    });
  }

  setMap(map: L.Map) {
    if ((<any>navigator).standalone) {
      return;
    }
    map.addControl(this.fullscreen);
    // Prevent activating full screen when focus is somewhere else
    // eg. typing into an input. Adopted from:
    // https://github.com/Leaflet/Leaflet/blob/37d2fd15ad6518c254fae3e033177e96c48b5012/src/map/handler/Map.Keyboard.js
    map.on('focus', this.addHook, this);
    map.on('blur', this.removeHook, this);
    L.DomEvent.on(map.getContainer(), 'focus', this.addHook, this);
    L.DomEvent.on(map.getContainer(), 'blur', this.removeHook, this);
    // Map is focused upon initialization
    this.addHook();
  }

  private addHook() {
    L.DomEvent.on(document.body, 'keydown', this.onKeyDown, this);
  }

  private removeHook() {
    L.DomEvent.off(document.body, 'keydown', this.onKeyDown, this);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }

    if (e.code === 'KeyF' && this.controller.map) {
      this.controller.map.toggleFullscreen();
    }
  }
}
