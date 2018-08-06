var $ = require('util'),
    klass = require('vendor/klass'),
    L = require('vendor/leaflet');

module.exports = klass({
    initialize: function(options) {
      this.options = options;
      this.el = document.getElementById('routing-panel');

      // Event handlers
      var clearButton = this.el.querySelector('.routing-panel-clear-button');
      $.on(clearButton, 'click', this.options.onClear, this);
      $.fastClick(clearButton);

      var closeButton = this.el.querySelector('.routing-panel-close-button');
      $.on(closeButton, 'click', this.options.onClose, this);
      $.fastClick(closeButton);
    },

    setStats: function(stats) {
      var distance = this.el.querySelector('.routing-panel-distance');
      distance.innerHTML = formatDistance(stats.totalDistance);
    }
});

function formatDistance(meters) {
  if (meters > 0) {
    return Math.round(meters / 1000) + ' km';
  } else {
    return '0 km';
  }
}
