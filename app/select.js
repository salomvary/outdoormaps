var Events = require('leaflet').Mixin.Events,
    klass = require('klass'),
    $ = require('./util');

module.exports = klass($.extend({
  initialize: function(el, options) {
    this.el = el;
    this.options = options || {};
    this.render();
    $.fastClick(el);

    if (this.options.values) {
      this.setValues(this.options.values);
    }
    this.setupListeners();
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

  setValues: function(values) {
    updateSelectOptions(this.el, values);
    this.setupListeners();
    this.update(this._value);
  },

  setDisabled: function(values) {
    values = values || [];
    var buttons = this.el.querySelectorAll('button');
    $.eachNode(buttons, function(button) {
      button.disabled = values.indexOf(button.name) > -1;
    });
  },

  setupListeners: function() {
    // handle click events
    // XXX no event delegation on iOS Safari :(
    var buttons = this.el.querySelectorAll('button');
    $.eachNode(buttons, function(button) {
      $.on(button, 'click', onClick, this);
    }, this);
  }
 }, Events));

function updateSelectOptions(wrapper, values) {
  wrapper.innerHTML = '';
  var options = document.createDocumentFragment();
  Object.keys(values).forEach(function(key) {
    var button = document.createElement('button');
    button.name = key;
    button.className = 'flat-btn';
    button.innerHTML = values[key];
    options.appendChild(button);
  });
  wrapper.appendChild(options);
}

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
