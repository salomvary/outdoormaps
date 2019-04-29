import 'leaflet-routing-machine';
import {Routing} from 'leaflet';

declare module 'leaflet' {
  namespace Routing {
    function mapbox(key: string, options?: object): Routing.IRouter
    function graphHopper(key: string, options?: object): Routing.IRouter
    interface RoutingControlOptions {
      itineraryBuilder: Routing.ItineraryBuilder;
      createMarker?: (waypointIndex: number, waypoint: Waypoint, numberWaypoints: number) => Marker;
    }
    interface IRouteSummary {
      totalAscend: number;
      totalDescend: number;
    }
  }
}
