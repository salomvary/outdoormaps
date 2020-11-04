import $ from './util';
import { Evented } from 'leaflet';

let currentHash: string;

const Location = $.extend(
  {
    get: function () {
      return window.location.hash.substring(1);
    },

    set: function (hash: string) {
      currentHash = hash;
      window.location.hash = hash;
    },
  },
  Evented.prototype
);

export default Location;

$.on(window, 'hashchange', onHashChange);
currentHash = Location.get();

function onHashChange() {
  if (Location.get() !== currentHash) {
    Location.fire('change');
  }
  currentHash = Location.get();
}
