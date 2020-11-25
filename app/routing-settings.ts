import routingServices from './routing-services';
import $ from './util';
import ButtonGroup from './button-group';
import { SelectChangeEvent } from './select';

interface RoutingSettingsOptions {
  routingService: string;
  onRoutingServiceChange: (routingService: string) => void;
}

export default class RoutingSettings {
  private options: RoutingSettingsOptions;
  private el: HTMLElement;
  private routingService: string;
  private routingServiceButtons: ButtonGroup;

  constructor(options: RoutingSettingsOptions) {
    this.options = options;
    this.routingService = options.routingService;
    this.el = document.getElementById('routing-settings')!;

    // event handlers
    const closeButton = this.el.querySelector('.close-page-button')!;
    $.on(closeButton, 'click', this.close, this);
    $.fastClick(closeButton);

    this.createButtons();
    this.updateButtons();
  }

  toggle() {
    const show = this.el.style.display === 'none';
    if (show) {
      $.show(this.el);
    } else {
      $.hide(this.el);
    }
  }

  close() {
    $.hide(this.el);
  }

  private onRoutingServiceChange(event: SelectChangeEvent) {
    this.routingService = event.value;
    this.options.onRoutingServiceChange(this.routingService);
    this.updateButtons();
  }

  private createButtons() {
    const container = this.el.querySelector('.routing-services')!;
    const values = routingServices
      .keys()
      .reduce(function (values, routingService) {
        const title = routingServices.get(routingService).title;
        values[routingService] = title;
        return values;
      }, {} as { [key: string]: string });
    const buttons = new ButtonGroup({ values }).on(
      'change',
      this.onRoutingServiceChange,
      this
    );
    container.appendChild(buttons.el);
    this.routingServiceButtons = buttons;
  }

  private updateButtons() {
    this.routingServiceButtons.set(this.routingService);

    // XXX fix a strange Chrome issue that settings doesn't repaint
    this.el.style.opacity = '1';
  }
}
