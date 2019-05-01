import $ from './util';
import * as L from 'leaflet';
import RoutingPanel from './routing-panel';
import RoutingSettings from './routing-settings';
import routingServices from './routing-services';
import gpxExport from './gpx-export';

import 'leaflet-routing-machine';
import StateStore from './state-store';
import Map, { MapButton } from './map';

var routeStartIcon = L.divIcon({
  iconSize: [20, 20],
  className: 'route-start-icon'
});

var routeWaypointIcon = L.divIcon({
  iconSize: [20, 20],
  className: 'route-waypoint-icon'
});

var noOpItineraryBuilder = {
  createContainer() {
    return document.createElement('span');
  },

  createStepsContainer() {
    return document.createElement('span');
  },

  createStep() {
    return document.createElement('span');
  }
};

export default class Routing {
  private controller: Map
  private options: StateStore
  private map: L.Map

  private routingVehicle: string
  private routingService: string
  private panel: any
  private settings: any
  private button: MapButton
  private routingControl: L.Routing.Control
  private selectedRoute: L.Routing.IRoute
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

  private onMapClick(e: L.LocationEvent) {
    this.addWaypoint(e.latlng);
  }

  private onClear() {
    this.panel.setStats({});
    this.selectedRoute = null;
    this.routingControl.setWaypoints([]);
  }

  private onClose() {
    this.hide();
  }

  private onRouteSelected(event: L.Routing.RouteSelectedEvent) {
    this.selectedRoute = event.route;
    this.panel.setStats(event.route.summary);
    this.options.save();
  }

  private onContextMenu(i: number, event: L.LocationEvent) {
    var deleteButton = $.create('button', 'delete-button');
    $.on(deleteButton, 'click', this.onDeleteWaypointClick.bind(this, i));
    deleteButton.innerHTML = '&nbsp;';

    L.popup({offset: [0, -2]})
      .setLatLng(event.latlng)
      .setContent(deleteButton)
      .openOn(this.map);
  }

  private onDeleteWaypointClick(i: number) {
    this.map.closePopup();
    this.removeWaypoint(i);
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
      this.map.on('click', this.onMapClick, this);
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
      this.map.off('click', this.onMapClick, this);
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
    this.routingControl = L.Routing.control({
      waypoints: <L.LatLng[]>this.options.get('routingWaypoints'),
      router: router,
      // Hide itinerary for now (there is no better way)
      summaryTemplate: '',
      itineraryBuilder: noOpItineraryBuilder,
      createMarker: this.createMarker.bind(this),
      fitSelectedRoutes: false
    }).addTo(this.map);
    this.routingControl.on('routeselected', this.onRouteSelected, this);
    this.routingControl.on('waypointschanged', this.onWaypointsChanged, this);
  }

  private updateRoutingVehicle() {
    var routingService = routingServices.get(this.routingService);
    var router = this.routingControl.getRouter();
    routingService.updateVehicle(router, this.routingVehicle);
  }

  private updateRoutingService() {
    var routingService = routingServices.get(this.routingService);
    var router = routingService.create(this.routingVehicle);
    // _router is a "private" property but updating it seems to be fine
    (<any>(this.routingControl))._router = router;
  }

  private createMarker(i: number, waypoint: L.Routing.Waypoint) {
    return L.marker(waypoint.latLng, {
      icon: i === 0 ? routeStartIcon : routeWaypointIcon,
      draggable: true
    })
      .on('contextmenu', this.onContextMenu.bind(this, i))
      .on('click', function(e) {
        // Prevent adding a route point when a marker is clicked
        (<any>e).originalEvent.stopPropagation();
      });
  }

  private removeWaypoint(i: number) {
    this.routingControl.spliceWaypoints(i, 1);
  }

  private addWaypoint(latlng: L.LatLng) {
    var currentWaypoints = this.routingControl.getWaypoints();
    // Sadly, the initial state is two waypoints with undefined latlng
    if (currentWaypoints.length > 0 && !currentWaypoints[0].latLng) {
      // Replace the first undefined one
      this.routingControl.spliceWaypoints(0, 1, <any>latlng);
    } else if (currentWaypoints.length > 1 && !currentWaypoints[1].latLng) {
      // Replace the second undefined one
      this.routingControl.spliceWaypoints(1, 1, <any>latlng);
    } else {
      // Apped third or later one
      this.routingControl.spliceWaypoints(currentWaypoints.length, 0, <any>latlng);
    }
  }

  private saveWaypoints() {
    var waypoints = this.routingControl.getWaypoints()
      .map(function(waypoint) {
        return waypoint.latLng;
      })
      // Empty state is two waypoints with null latLngs
      .filter(function(latLngs) {
        return !!latLngs;
      });
    this.options.set('routingWaypoints', waypoints);
  }
}
