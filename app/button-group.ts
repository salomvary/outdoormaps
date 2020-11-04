import Select, { SelectOptions } from './select';

export default class ButtonGroup extends Select {
  constructor(options: SelectOptions) {
    const g = document.createElement('fieldset');
    g.className = 'control-group';
    render(g, options.values);
    super(g, Object.assign(options, { values: undefined }));
  }
}

function render(el: HTMLElement, values: { [key: string]: string }) {
  Object.keys(values).forEach(function (key) {
    const button = document.createElement('button');
    button.className = 'radio-btn';
    button.name = key;
    button.innerHTML = values[key];
    //button.style.width = (100 / layers.length) + '%';
    el.appendChild(button);
  });
}
