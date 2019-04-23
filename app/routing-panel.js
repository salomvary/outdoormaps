var $ = require('./util'),
    klass = require('klass'),
    Select = require('./select');

module.exports = klass({
    initialize: function(options) {
      this.options = options;
      this.vehicles = options.vehicles;
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

      var settingsButton = this.el.querySelector('.routing-panel-settings-button');
      $.on(settingsButton, 'click', this.options.onSettings, this);
      $.fastClick(settingsButton);

      // Buttons on large screens
      this.vehicleButtons = new Select(this.el.querySelector('.routing-vehicle-buttons'))
        .on('change', this.onVehicleButtonsChange, this);
      this.updateVehicleButtons();

      // Select on small ones
      this.vehicleSelect = this.el.querySelector('.routing-vehicle-select');
      $.on(this.vehicleSelect, 'change', this.onVehicleSelectChange, this);
      this.updateVehicleSelect();
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
    },

    setVehicles: function(vehicles) {
      this.vehicles = vehicles;
      this.updateVehicleSelect();
      this.updateVehicleButtons();
    },

    updateVehicleSelect: function() {
      setSelectValues(this.vehicleSelect, this.vehicles);
      this.vehicleSelect.value = this.options.routingVehicle;
    },

    updateVehicleButtons: function() {
      this.vehicleButtons.setValues(this.vehicles);
      this.vehicleButtons.set(this.options.routingVehicle);
    }
});

function setSelectValues(select, values) {
  select.innerHTML = '';
  var options = document.createDocumentFragment();
  Object.keys(values).forEach(function(key) {
    var option = document.createElement('option');
    option.value = key;
    option.innerHTML = values[key];
    options.appendChild(option);
  });
  select.appendChild(options);
}

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
