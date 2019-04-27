import routingServices from './routing-services';
import klass from 'klass';
import $ from './util';
import ButtonGroup from './button-group';

export default klass({
  initialize: function(options) {
    this.options = options;
    this.routingService = options.routingService;
    this.el = document.getElementById('routing-settings');

    // event handlers
    var closeButton = this.el.querySelector('.close-page-button');
    $.on(closeButton, 'click', this.close, this);
    $.fastClick(closeButton);

    this.createButtons();
    this.updateButtons();
  },

  toggle: function() {
    var show = this.el.style.display === 'none';
    if (show) {
      $.show(this.el);
    } else {
      $.hide(this.el);
    }
  },

  close: function() {
    $.hide(this.el);
  },

  onRoutingServiceChange: function(event) {
    this.routingService = event.value;
    this.options.onRoutingServiceChange(this.routingService);
    this.updateButtons();
  },

  createButtons: function() {
    var container = this.el.querySelector('.routing-services');
    var values = routingServices.keys()
      .reduce(function(values, routingService) {
        var title = routingServices.get(routingService).title;
        values[routingService] = title;
        return values;
      }, {});
    var buttons = new ButtonGroup({values})
      .on('change', this.onRoutingServiceChange, this);
    container.appendChild(buttons.el);
    this.routingServiceButtons = buttons;
  },

  updateButtons: function() {
    this.routingServiceButtons.set(this.routingService);

    // XXX fix a strange Chrome issue that settings doesn't repaint
    this.el.style.opacity = 1;
  }
});
