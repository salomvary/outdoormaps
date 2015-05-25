var $ = require('util'),
    L = require('vendor/leaflet'),
    padding = 7,
    attributionHeight = 16,
    inputHeight = 40;

module.exports = L.Control.extend({
  onAdd: function() {
    var control = $.create('form', 'search-control');
    $.on(control, 'submit', this.onSubmit, this);
    L.DomEvent.disableClickPropagation(control);
    var wrapper = $.create('span', 'search-input-wrapper', control);

    // input
    var input = this.input = $.create('input', 'search-input', wrapper);
    // TODO use type=search and remove generated "clear" button
    input.type = 'text';
    input.placeholder = 'Search';
    $.on(input, 'input', this.onInput, this);
    $.on(input, 'focus', this.onFocus, this);
    $.on(input, 'blur', this.onBlur, this);
    $.fastClick(input, {focus: true});

    // hidden submit button
    // (needed on iOS to be able to submit from sw keyboard)
    var submitButton = $.create('button', 'search-button', wrapper);
    submitButton.innerHTML = 'Search';

    // clear button
    var clear = this.clearButton = $.create('button', 'search-clear', wrapper);
    clear.type = 'button';
    clear.innerHTML = '✕';
    $.on(clear, 'click', this.onClear, this);
    $.fastClick(clear);
    this.toggleClearButton();

    // results
    this.results = $.create('ul', 'search-results', control);
    this.adjustHeight();

    return control;
  },

  onFocus: function() {
    if (this.results.childNodes.length) {
      this.showResults();
    }
  },

  onBlur: function() {
    // hide results
    // make sure we can click on the list
    setTimeout(this.hideResults.bind(this), 10);
  },

  onInput: function() {
    this.options.onInput(this.getVal());
    this.toggleClearButton(this.input.value.length);
  },

  onSubmit: function(event) {
    event.preventDefault();
    this.options.onSubmit(this.getVal());
  },

  onClear: function() {
    this.input.value = '';
    this.input.focus();
    this.onInput();
  },

  onSelect: function(i, result) {
    this.input.value = result;
    this.options.onSelect(i);
    this.hideResults();
  },

  getVal: function() {
    return this.input.value.trim();
  },

  toggleClearButton: function(on) {
    this.clearButton.style.visibility = on ? 'visible' : 'hidden';
  },

  adjustHeight: function() {
    var height = window.innerHeight - 3 * padding - inputHeight - attributionHeight;
    this.results.style.maxHeight = height + 'px';
  },

  setResults: function(results) {
    this.results.innerHTML = '';
    if (results) {
      if (typeof results == 'string') {
        results = [results];
      }
      results.map(function(result, i) {
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
  },

  showResults: function() {
    $.toggleClass(this.getContainer(), 'show-results', true);
  },

  hideResults: function() {
    $.toggleClass(this.getContainer(), 'show-results', false);
  }
});
