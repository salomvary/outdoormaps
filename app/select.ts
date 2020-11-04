import { Evented, LeafletEvent } from 'leaflet';
import $ from './util';

export interface SelectOptions {
  values?: { [key: string]: string };
  toggle?: boolean;
}

export interface SelectChangeEvent extends LeafletEvent {
  value: string;
}

export default class Select extends Evented {
  el: HTMLElement;
  protected options: SelectOptions;
  protected _value: string;

  constructor(el: HTMLElement, options?: SelectOptions) {
    super();
    this.el = el;
    this.options = options || {};
    $.fastClick(el);

    if (this.options.values) {
      this.setValues(this.options.values);
    }
    this.setupListeners();
  }

  protected update(value: string) {
    var buttons = this.el.querySelectorAll('button');
    $.eachNode(buttons, function (button) {
      var active = button.name === value;
      $.toggleClass(button, 'active', active);
    });
  }

  get() {
    return this._value;
  }

  set(value: string) {
    this._value = value;
    this.update(value);
  }

  setValues(values: { [key: string]: string }) {
    updateSelectOptions(this.el, values);
    this.setupListeners();
    this.update(this._value);
  }

  setDisabled(values: string[]) {
    values = values || [];
    var buttons = this.el.querySelectorAll('button');
    $.eachNode(buttons, function (button) {
      button.disabled = values.indexOf(button.name) > -1;
    });
  }

  private setupListeners() {
    // handle click events
    // XXX no event delegation on iOS Safari :(
    var buttons = this.el.querySelectorAll('button');
    $.eachNode(
      buttons,
      function (button) {
        $.on(button, 'click', onClick, this);
      },
      this
    );
  }
}

function updateSelectOptions(
  wrapper: HTMLElement,
  values: { [key: string]: string }
) {
  wrapper.innerHTML = '';
  var options = document.createDocumentFragment();
  Object.keys(values).forEach(function (key) {
    var button = document.createElement('button');
    button.name = key;
    button.className = 'flat-btn';
    button.innerHTML = values[key];
    options.appendChild(button);
  });
  wrapper.appendChild(options);
}

function onClick(this: Select, event: MouseEvent) {
  var value = (<HTMLInputElement>event.target).name;
  if (this._value === value) {
    if (this.options.toggle) {
      value = null;
    } else {
      return;
    }
  }
  this.fire('change', { value: value });
  this.set(value);
}
