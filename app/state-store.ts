import klass from 'klass';
import $ from './util';
import * as L from 'leaflet';

export default klass({
  initialize: function() {
    this.properties = {};
    this.load();
  },

  set: function(key, value) {
    if (typeof key === 'object') {
      $.extend(this.properties, key);
    } else {
      this.properties[key] = value;
    }
    this.save();
  },

  get: function(key) {
    return key ? this.properties[key] : this.properties;
  },

  load: function() {
    var properties;
    if (window.localStorage && localStorage.turistautak) {
      try {
        properties = JSON.parse(localStorage.turistautak, reviver);
      } catch (e) {
        /* parse error, ignore it */
        window.console.error('Error parsing localStorage', e);
      }
      $.extend(this.properties, properties);
    }
  },

  save: function() {
    if (window.localStorage) {
      localStorage.turistautak = JSON.stringify(this.properties);
    }
  }
});

function reviver(k, v) {
  if (v.lat && v.lng) {
    return new L.LatLng(v.lat, v.lng);
  } else {
    return v;
  }
}
