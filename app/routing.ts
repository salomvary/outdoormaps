import $ from './util';
import * as L from 'leaflet';
import RoutingPanel from './routing-panel';
import RoutingSettings from './routing-settings';
import routingServices from './routing-services';
import gpxExport from './gpx-export';

import {Layer as RoutingLayer, RouteSelectedEvent, Route} from '@salomvary/leaflet-minirouter';
import StateStore from './state-store';
import Map, { MapButton } from './map';

const routeStartIcon = L.divIcon({
  iconSize: [20, 20],
  className: 'route-start-icon'
});

const routeWaypointIcon = L.divIcon({
  iconSize: [20, 20],
  className: 'route-waypoint-icon'
});

export default class Routing {
  private controller: Map
  private options: StateStore
  private map: L.Map

  private routingVehicle: string
  private routingService: string
  private panel: any
  private settings: any
  private button: MapButton
  private routingControl: RoutingLayer
  private selectedRoute: Route
  private active: boolean

  constructor(controller: Map, options: StateStore) {
    this.controller = controller;
    this.options = options;
    this.routingVehicle = options.get('routingVehicle') || 'bike';
    this.routingService = options.get('routingService') || 'mapbox';
    this.panel = new RoutingPanel({
      vehicles: this.getVehicles(),
      routingVehicle: this.routingVehicle,
      onClear: this.onClear.bind(this),
      onClose: this.onClose.bind(this),
      onExport: this.onExport.bind(this),
      onSettings: this.onSettings.bind(this),
      onVehicleChange: this.onVehicleChange.bind(this)
    });
    this.settings = new RoutingSettings({
      routingService: this.routingService,
      onRoutingServiceChange: this.onRoutingServiceChange.bind(this)
    });
  }

  setMap(map: L.Map) {
    this.map = map;
    this.button = this.controller.createButton('directions', 'topleft',
      this.toggleRouting, this);
    if (this.options.get('routingActive')) {
      this.show();
    }
  }

  private onClear() {
    this.panel.setStats({});
    this.selectedRoute = null;
    this.routingControl.setWaypoints([]);
  }

  private onClose() {
    this.hide();
  }

  private onRouteSelected(event: RouteSelectedEvent) {
    this.selectedRoute = event.route;
    this.panel.setStats(event.route.summary);
    this.options.save();
  }

  private onExport() {
    gpxExport(this.selectedRoute.coordinates);
  }

  private onSettings() {
    this.settings.toggle();
  }

  private onWaypointsChanged() {
    this.saveWaypoints();
  }

  private getVehicles() {
    var vehicles = routingServices.get(this.routingService).vehicles;
    return Object.keys(vehicles)
      .reduce(function(acc, key) {
        acc[key] = vehicles[key].title;
        return acc;
      }, {});
  }

  private onVehicleChange(value: string) {
    this.routingVehicle = value;
    this.options.set('routingVehicle', this.routingVehicle);
    this.updateRoutingVehicle();
    this.routingControl.route();
  }

  private onRoutingServiceChange(value: string) {
    this.routingService = value;
    this.options.set('routingService', this.routingService);
    this.updateRoutingService();
    this.routingControl.route();
  }

  private toggleRouting() {
    if (!this.active) {
      this.show();
    } else {
      this.hide();
    }
  }

  private show() {
    if (!this.active) {
      this.active = true;
      this.togglePanel(true);
      this.addRoutingControl();
      this.options.set('routingActive', this.active);
      this.options.save();
    }
  }

  private hide() {
    if (this.active) {
      this.active = false;
      this.togglePanel(false);
      this.routingControl.remove();
      this.routingControl = null;
      this.options.set('routingActive', this.active);
      this.options.save();
    }
  }

  private togglePanel(active: boolean) {
    $.toggleClass(document.body, 'routing-panel-active', active);
  }

  private addRoutingControl() {
    var routingService = routingServices.get(this.routingService);
    var router = routingService.create(this.routingVehicle);
    this.routingControl = new RoutingLayer({
      waypoints: this.options.get('routingWaypoints'),
      router,
      createMarker: this.createMarker
    }).addTo(this.map);
    this.routingControl.on('routeselected', this.onRouteSelected, this);
    this.routingControl.on('waypointschanged', this.onWaypointsChanged, this);
  }

  private updateRoutingVehicle() {
    var routingService = routingServices.get(this.routingService);
    var router = this.routingControl.router;
    routingService.updateVehicle(router, this.routingVehicle);
  }

  private updateRoutingService() {
    var routingService = routingServices.get(this.routingService);
    var router = routingService.create(this.routingVehicle);
    this.routingControl.router = router;
  }

  private saveWaypoints() {
    var waypoints = this.routingControl.getWaypoints();
    this.options.set('routingWaypoints', waypoints);
  }

  private createMarker(
    latLng: L.LatLngExpression,
    options: L.MarkerOptions,
    index: number
  ): L.Marker {
    return L.marker(latLng, {
      ...options,
      icon: index === 0 ? routeStartIcon : routeWaypointIcon
    });
  }
}
