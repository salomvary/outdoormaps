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

    // hidden submit button
    // (needed on iOS to be able to submit from sw keyboard)
    var submitButton = $.create('button', 'search-button', wrapper);
    submitButton.innerHTML = 'Search';

    // clear button
    var clear = this.clearButton = $.create('button', 'search-clear', wrapper);
    clear.type = 'button';
    clear.innerHTML = '✕';
    $.on(clear, 'click', this.onClear, this);
    $.on(clear, 'touchstart', this.onClear, this);
    this.toggleClearButton();

    // results
    var results = this.results = $.create('ul', 'search-results', control);
    $.on(results, 'touchstart', this.onResultsTouch, this);
    this.adjustHeight();

    return control;
  },

  onFocus: function() {
    if (this.results.childNodes.length) {
      this.showResults();
    }
  },

  onBlur: function() {
    // hide results on desktop browsers
    // TODO: instead of blur it should be something like:
    // anything else than interacting with the search happens
    if (!L.Browser.touch) {
      // make sure we can click on the list
      setTimeout(this.hideResults.bind(this), 10);
    }
  },

  onResultsTouch: function() {
    // blur so that the sw keyboard is not whown anymore
    this.input.blur();
  },

  onInput: function() {
    this.options.onInput(this.getVal());
    this.toggleClearButton(this.input.value.length);
  },

  onSubmit: function(event) {
    event.preventDefault();
    this.options.onSubmit(this.getVal());
  },

  onClear: function(event) {
    // don't tap on the input
    event.preventDefault();
    this.input.value = '';
    this.onInput();
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
        var select = this.options.onSelect.bind(null, i);
        $.on(res, 'click', select);
        $.on(res, 'touchstart', select);
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
