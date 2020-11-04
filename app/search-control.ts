import * as L from 'leaflet';
import $ from './util';

const padding = 7;
const attributionHeight = 16;
const inputHeight = 40;

interface SearchControlOptions extends L.ControlOptions {
  onInput: (val: string) => void;
  onSubmit: (val: string) => void;
  onSelect: (i: number) => void;
}

export default class SearchControl extends L.Control {
  private input: HTMLInputElement
  private clearButton: HTMLInputElement
  private results: HTMLElement
  options: SearchControlOptions

  constructor(options: SearchControlOptions) {
    super(options);
  }

  onAdd() {
    var control = $.create('form', 'search-control');
    $.on(control, 'submit', this.onSubmit, this);
    L.DomEvent.disableClickPropagation(control);
    var wrapper = $.create('span', 'search-input-wrapper', control);

    // input
    var input = this.input = <HTMLInputElement>$.create('input', 'search-input', wrapper);
    // TODO use type=search and remove generated "clear" button
    input.type = 'text';
    input.placeholder = 'Search';
    $.on(input, 'input', this.onInput, this);
    $.on(input, 'focus', this.onFocus, this);
    $.on(input, 'blur', this.onBlur, this);
    $.on(input, 'contextmenu', this.onContextMenu, this);
    $.fastClick(input, {focus: true});

    // hidden submit button
    // (needed on iOS to be able to submit from sw keyboard)
    var submitButton = $.create('button', 'search-button', wrapper);
    submitButton.innerHTML = 'Search';

    // clear button
    var clear = this.clearButton = <HTMLInputElement>$.create('button', 'search-clear', wrapper);
    clear.type = 'button';
    clear.innerHTML = '✕';
    $.on(clear, 'click', this.onClear, this);
    $.fastClick(clear);
    this.toggleClearButton();

    // results
    this.results = <HTMLUListElement>$.create('ul', 'search-results', control);
    this.adjustHeight();

    return control;
  }

  private onFocus() {
    if (this.results.childNodes.length) {
      this.showResults();
    }
  }

  private onBlur() {
    // hide results
    // make sure we can click on the list
    setTimeout(this.hideResults.bind(this), 100);
  }

  private onInput(e?: InputEvent) {
    if (e) {
      // Prevent entering full screen when someone types "f"
      e.stopPropagation();
    }
    this.options.onInput(this.getVal());
    this.toggleClearButton(this.input.value.length > 0);
  }

  private onSubmit(event: Event) {
    event.preventDefault();
    this.options.onSubmit(this.getVal());
  }

  private onClear() {
    this.input.value = '';
    this.input.focus();
    this.onInput();
  }

  private onSelect(i: number, result: string) {
    this.input.value = result;
    this.options.onSelect(i);
    this.hideResults();
  }

  private getVal() {
    return this.input.value.trim();
  }

  private onContextMenu(event: Event) {
    event.stopPropagation();
  }

  private toggleClearButton(on?: boolean) {
    this.clearButton.style.visibility = on ? 'visible' : 'hidden';
  }

  private adjustHeight() {
    var height = window.innerHeight - 3 * padding - inputHeight - attributionHeight;
    this.results.style.maxHeight = height + 'px';
  }

  setResults(results: string | string[]) {
    this.results.innerHTML = '';
    if (results) {
      if (typeof results == 'string') {
        results = [results];
      }
      results.map(function(this: SearchControl, result, i) {
        var res = $.create('li', 'search-result');
        res.innerHTML = result;
        var select = this.onSelect.bind(this, i, result);
        $.on(res, 'click', select);
        $.fastClick(res);
        this.results.appendChild(res);
      }, this);
    }
    if (results && results.length) {
      this.showResults();
    } else {
      this.hideResults();
    }
  }

  private showResults() {
    $.toggleClass(this.getContainer(), 'show-results', true);
  }

  hideResults() {
    $.toggleClass(this.getContainer(), 'show-results', false);
  }
}
