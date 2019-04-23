var klass = require('klass'),
    Location = require('./location');

module.exports = klass({
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
