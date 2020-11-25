import Location from './location';
import Map from './map';
import { MapPlugin } from './map-plugin';

export default class Router {
  protected handlers: MapPlugin[];

  constructor(controller: Map) {
    this.handlers = controller.plugins.filter(function (plugin) {
      return plugin.route;
    });
    route.call(this);
    Location.on('change', route, this);
  }
}

function route(this: Router) {
  const location = Location.get();
  this.handlers.forEach(function (plugin) {
    plugin.route && plugin.route(location);
  });
}
