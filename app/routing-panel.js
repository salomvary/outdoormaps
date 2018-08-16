var $ = require('util'),
    klass = require('vendor/klass'),
    L = require('vendor/leaflet'),
    Select = require('select');

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

      var exportButton = this.el.querySelector('.routing-panel-export-button');
      $.on(exportButton, 'click', this.options.onExport, this);
      $.fastClick(exportButton);

      // Buttons on large screens
      this.vehicleButtons = new Select(this.el.querySelector('.routing-vehicle-buttons'))
        .on('change', this.onVehicleButtonsChange, this);
      this.vehicleButtons.set(this.options.routingVehicle);

      // Select on small ones
      this.vehicleSelect = this.el.querySelector('.routing-vehicle-select');
      $.on(this.vehicleSelect, 'change', this.onVehicleSelectChange, this);
      this.vehicleSelect.value = this.options.routingVehicle;
    },

    onVehicleButtonsChange: function(event) {
      var value = event.value;
      this.vehicleSelect.value = value;
      this.options.onVehicleChange(value);
    },

    onVehicleSelectChange: function(event) {
      var value = event.target.value;
      this.vehicleButtons.set(value);
      this.options.onVehicleChange(value);
    },

    setStats: function(stats) {
      var distance = this.el.querySelector('.routing-panel-distance');
      distance.innerHTML = formatDistance(stats.totalDistance);

      var ascent = this.el.querySelector('.routing-panel-ascent');
      ascent.innerHTML = formatElevation(stats.totalAscend);

      var descent = this.el.querySelector('.routing-panel-descent');
      descent.innerHTML = formatElevation(stats.totalDescend);
    }
});

function formatDistance(meters) {
  if (meters > 0) {
    return Math.round(meters / 1000) + ' km';
  } else {
    return '0 km';
  }
}

function formatElevation(meters) {
  if (meters > 0) {
    return Math.round(meters) + ' m';
  } else {
    return '0 m';
  }
}
