import $ from './util';
import * as L from 'leaflet';

export default class StateStore {
  private properties: {}

  constructor() {
    this.properties = {};
    this.load();
  }

  set(key: string | object, value?: any) {
    if (typeof key === 'object') {
      $.extend(this.properties, key);
    } else {
      this.properties[key] = value;
    }
    this.save();
  }

  get(key?: string) {
    return key ? this.properties[key] : this.properties;
  }

  load() {
    var properties: {};
    if (window.localStorage && localStorage.turistautak) {
      try {
        properties = JSON.parse(localStorage.turistautak, reviver);
      } catch (e) {
        /* parse error, ignore it */
        window.console.error('Error parsing localStorage', e);
      }
      $.extend(this.properties, properties);
    }
  }

  save() {
    if (window.localStorage) {
      localStorage.turistautak = JSON.stringify(this.properties);
    }
  }
}

function reviver(k, v) {
  if (v.lat && v.lng) {
    return new L.LatLng(v.lat, v.lng);
  } else {
    return v;
  }
}
