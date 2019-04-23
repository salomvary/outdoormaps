var Select = require('./select');

module.exports = Select.extend({
  initialize: function(options, values) {
    this.values = values;
    var g = document.createElement('fieldset');
    g.className = 'control-group';
    Select.prototype.initialize.call(this, g, options);
  },

  render: function() {
    Object.keys(this.values).forEach(function(key) {
      var button = document.createElement('button');
      button.className = 'radio-btn';
      button.name = key;
      button.innerHTML = this.values[key];
      //button.style.width = (100 / layers.length) + '%';
      this.el.appendChild(button);
    }, this);
  }
});
