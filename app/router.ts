import klass from 'klass';
import Location from './location';

export default klass({
  initialize: function(controller) {
    this.handlers = controller.plugins.filter(function(plugin) {
      return plugin.route;
    });
    route.call(this);
    Location.on('change', route, this);
  }
});

function route() {
  var location = Location.get();
  this.handlers.forEach(function(plugin) {
    return plugin.route(location);
  });
}
