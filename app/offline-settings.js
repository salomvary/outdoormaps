var Layers = require('layers'),
    klass = require('vendor/klass'),
    $ = require('util'),
    L = require('vendor/leaflet');

module.exports = klass({
  initialize: function(controller, options) {
    this.controller = controller;
    // initial state
    //$.hide(this.el.saving);
    //$.hide(this.el.saved);
    //
    //$.on(this.el.saveButton, 'click', this.saveMap, this);
    //cancelSave.addEventListener('click', cancelSave, false);


    /*
    if(offline && offline.isSupported) {
      if(offline.hasTiles) {
        show(saved);
      }
    } else {
      hide(offlineView);
    }
    */
    //saving: document.getElementById('saving'),
    //saved: document.getElementById('saved'),
    //saveButton: document.getElementById('save-button'),
    //cancelButton = document.getElementById('cancel-button'),

    /*
    $.extend(this.el, {
      progress: this.el.saving.querySelector('progress'),
    });
    offlineView = document.querySelector('.offline'),
    },
    */
  },

  updateButtons: function() {
    // enable/disable save offline
    //saveButton.disabled = mapType !== 'turistautak';
  }
});





  /*
function saveMap() {
  var promise = offline.getTiles(map, layers.turistautak,
    map.getBounds(), map.getZoom(), map.getZoom() + 3);
  promise.then(mapSaved, mapSaveFailed, mapSaveProgress);
  show(saving);
  hide(saved);
  return false;
}

function mapSaved() {
  hide(saving);
  show(saved);
}

function mapSaveFailed() {
  hide(saving);
  hide(saved);
  alert('Failed to save map');
}

function mapSaveProgress(done, count) {
  progress.max = count;
  progress.value = done;
}
*/

