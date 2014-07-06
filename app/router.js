var $ = require('util'),
    klass = require('vendor/klass'),
    Location = require('location');

module.exports = klass({
  initialize: function(controller) {
    this.handlers = controller.plugins.filter(function(plugin) {
      return plugin.route;
    });
    $.on(window, 'hashchange', route, this);
    route.call(this);
  }
});

function route() {
  var location = Location.get();
  this.handlers.some(function(plugin) {
    return plugin.route(location);
  });
}
