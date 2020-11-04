import $ from './util';
import Select, { SelectChangeEvent } from './select';
import { RouteSummary } from '@salomvary/leaflet-minirouter';

interface RoutingPanelOptions {
  vehicles: { [key: string]: string };
  routingVehicle: string;
  onClear: () => void;
  onClose: () => void;
  onExport: () => void;
  onSettings: () => void;
  onVehicleChange: (vehicle: string) => void;
}

export default class RoutingPanel {
  private options: RoutingPanelOptions;
  private vehicles: { [key: string]: string };
  private el: HTMLElement;
  private vehicleButtons: Select;
  private vehicleSelect: HTMLSelectElement;

  constructor(options: RoutingPanelOptions) {
    this.options = options;
    this.vehicles = options.vehicles;
    this.el = document.getElementById('routing-panel');

    // Event handlers
    const clearButton = this.el.querySelector('.routing-panel-clear-button');
    $.on(clearButton, 'click', this.options.onClear, this);
    $.fastClick(clearButton);

    const closeButton = this.el.querySelector('.routing-panel-close-button');
    $.on(closeButton, 'click', this.options.onClose, this);
    $.fastClick(closeButton);

    const exportButton = this.el.querySelector('.routing-panel-export-button');
    $.on(exportButton, 'click', this.options.onExport, this);
    $.fastClick(exportButton);

    const settingsButton = this.el.querySelector(
      '.routing-panel-settings-button'
    );
    $.on(settingsButton, 'click', this.options.onSettings, this);
    $.fastClick(settingsButton);

    // Buttons on large screens
    this.vehicleButtons = new Select(
      this.el.querySelector('.routing-vehicle-buttons')
    ).on('change', this.onVehicleButtonsChange, this);
    this.updateVehicleButtons();

    // Select on small ones
    this.vehicleSelect = this.el.querySelector('.routing-vehicle-select');
    $.on(this.vehicleSelect, 'change', this.onVehicleSelectChange, this);
    this.updateVehicleSelect();
  }

  private onVehicleButtonsChange(event: SelectChangeEvent) {
    const value = event.value;
    this.vehicleSelect.value = value;
    this.options.onVehicleChange(value);
  }

  private onVehicleSelectChange(event: SelectChangeEvent) {
    const value = event.target.value;
    this.vehicleButtons.set(value);
    this.options.onVehicleChange(value);
  }

  setStats(stats: RouteSummary) {
    const distance = this.el.querySelector('.routing-panel-distance');
    distance.innerHTML = formatDistance(stats.totalDistance);

    const ascent = this.el.querySelector('.routing-panel-ascent');
    ascent.innerHTML = formatElevation(stats.totalAscend);

    const descent = this.el.querySelector('.routing-panel-descent');
    descent.innerHTML = formatElevation(stats.totalDescend);
  }

  private setVehicles(vehicles: { [key: string]: string }) {
    this.vehicles = vehicles;
    this.updateVehicleSelect();
    this.updateVehicleButtons();
  }

  private updateVehicleSelect() {
    setSelectValues(this.vehicleSelect, this.vehicles);
    this.vehicleSelect.value = this.options.routingVehicle;
  }

  private updateVehicleButtons() {
    this.vehicleButtons.setValues(this.vehicles);
    this.vehicleButtons.set(this.options.routingVehicle);
  }
}

function setSelectValues(
  select: HTMLSelectElement,
  values: { [key: string]: string }
) {
  select.innerHTML = '';
  const options = document.createDocumentFragment();
  Object.keys(values).forEach(function (key) {
    const option = document.createElement('option');
    option.value = key;
    option.innerHTML = values[key];
    options.appendChild(option);
  });
  select.appendChild(options);
}

function formatDistance(meters: number) {
  if (meters > 0) {
    return Math.round(meters / 1000) + ' km';
  } else {
    return '0 km';
  }
}

function formatElevation(meters: number) {
  if (meters > 0) {
    return Math.round(meters) + ' m';
  } else {
    return '0 m';
  }
}
