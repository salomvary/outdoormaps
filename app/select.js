var Events = require('vendor/leaflet').Mixin.Events,
    klass = require('vendor/klass'),
    $ = require('util');

module.exports = klass($.extend({
  initialize: function(el, options) {
    this.el = el;
    this.options = options || {};
    this.render();
    $.fastClick(el);

    // handle click events
    // XXX no event delegation on iOS Safari :(
    var buttons = this.el.querySelectorAll('button');
    $.eachNode(buttons, function(button) {
      $.on(button, 'click', onClick, this);
    }, this);
  },

  /** @protected */
  render: function() {},

  /** @protected */
  update: function(value) {
    var buttons = this.el.querySelectorAll('button');
    $.eachNode(buttons, function(button) {
      var active = button.name === value;
      $.toggleClass(button, 'active', active);
    });
  },

  get: function() {
    return this._value;
  },

  set: function(value) {
    this._value = value;
    this.update(value);
  },

  setDisabled: function(values) {
    values = values || [];
    var buttons = this.el.querySelectorAll('button');
    $.eachNode(buttons, function(button) {
      button.disabled = values.indexOf(button.name) > -1;
    });
  }
}, Events));

function onClick(event) {
  var value = event.target.name;
  if (this._value === value) {
    if (this.options.toggle) {
      value = null;
    } else {
      return;
    }
  }
  this.fire('change', {value: value});
  this.set(value);
}
