window.addToHomeConfig = {
  returningVisitor: true
};

require.config({
  deps: ['polyfills', 'vendor/add-to-homescreen/src/add2home'],
  paths: {
    'vendor/leaflet': 'vendor/leaflet.js/leaflet-src'
  },
  shim: {
    'vendor/leaflet': {
      exports: 'L'
    },
    'vendor/bing-layer': ['vendor/leaflet']
  }
});

define(function(require, exports, module) {

  var L = require('vendor/leaflet'),
      layers = require('layers'),
      settings = require('settings'),
      flags = require('flags'),
      offline = require('offline');

  L.Icon.Default.imagePath = 'vendor/leaflet.js/images';

  var marker,
    map,
    mapType = 'turistautak',
    hikingMapType;

  var mapDefaults = {
    center: new L.LatLng(47.3, 19.5),
    zoom: 8,
    zoomControl: false
  };

  var MapButton = L.Control.extend({
    onAdd: function(map) {
      var button = document.createElement('button');
      button.className = this.options.className + '-button';
      button.type = 'button';
      button.addEventListener('click', this.options.handler, false);
      return button;
    }
  });

  function initialize() {
    var state,
      mapOptions = {};

    // get state from storage
    state = loadStorageState();

    // override with state from url
    loadHashState(state);

    deserialize(state);

    // add options to defaults from state
    for(var key in mapDefaults) {
      if(mapDefaults.hasOwnProperty(key)) {
        if(key in state) {
          mapOptions[key] = state[key];
          delete state[key]; // so we won't set it again
        } else {
          mapOptions[key] = mapDefaults[key];
        }
      }
    }

    map = new L.Map('map', mapOptions);
    map.addControl(L.control.scale({imperial: false}));
    map.getContainer().focus();

    // set the rest of the state
    setState(state);

    /*
    maps.event.addListener(map, 'maptypeid_changed', updateOverlays);
    maps.event.addListener(map, 'maptypeid_changed', saveState);
    maps.event.addListener(map, 'idle', saveState);
    maps.event.addListener(map, 'rightclick', dropMarker);
    */
    map.on('moveend', saveState);
    map.on('zoomend', saveState);
    map.on('contextmenu', dropMarker);

    if(navigator.geolocation) {
      createButton('locate', 'topleft', getCurrentPosition);
      // try to get current location
      // if we don't have a saved location and/or don't know the
      // default hiking map type
      if(! hikingMapType || ! state.position) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = new L.LatLng(position.coords.latitude, position.coords.longitude);
          if(! hikingMapType) {
            var mapType = isHungary(pos) ? 'turistautak' : 'wanderkarte';
            setHikingMapType(mapType);
            setMapType(mapType);
          }
          if(! state.position) {
            showPosition(position);
          }
        }, function() {
          // error falback
          setHikingMapType('turistautak');
        });
      }
    } else {
      setHikingMapType('turistautak');
    }

    createButton('settings', 'topright', toggleSettings);

    // add zoom-control for non-pinch-zoom devices
    if(! /(iPhone|iPod|iPad).*AppleWebKit/i.test(navigator.userAgent)) {
      map.addControl(L.control.zoom());
    }

    // offline mode and settings view
    if(flags.isEnabled('offline')) {
      offline.initialize('turistautak').then(function() {
        // offline mode
        if(offline.hasTiles) {
          map.mapTypes.set('turistautak', offline.extend(turistautak.DEFAULT));
        }
        settings.initialize(map, offline);
      }, function(err) {
        settings.initialize(map, offline);
        throw err.message;
      });
    } else {
      settings.initialize(map);
    }
  }

  function createButton(className, position, handler) {
    map.addControl(new MapButton({
      className: className,
      position: position,
      handler: handler
    }));
  }

  function isHungary(latLng) {
    // approximate bounding box of hungary
    return new L.LatLngBounds(
      new L.LatLng(48.6, 16), // sw
      new L.LatLng(45.6, 23.2) // ne
    ).contains(latLng);
  }

  function getCurrentPosition() {
    navigator.geolocation.getAccurateCurrentPosition(showPosition, positionError,
      showPosition, {desiredAccuracy:10, maxWait: 20000});
  }

  function positionError(error) {
    alert('Could not get your position: '+error.message);
  }

  function showPosition(position) {
    var center = new L.LatLng(position.coords.latitude, 
      position.coords.longitude);
    setMarker(center);
    if(map.getZoom() < 15) {
      map.setView(center, 15);
    } else {
      map.panTo(center);
    }
    saveState();
  }

  function dropMarker(event) {
    if(marker) {
      map.removeLayer(marker);
      marker = null;
    }
    setMarker(event.latlng, true);
    //marker.setAnimation(maps.Animation.DROP);
    saveHashState();
  }

  function moveMarker(event) {
    setMarker(event.latLng, true);
    saveHashState();
  }

  function setMarker(position, draggable) {
    if(! marker) {
      marker = new L.Marker(position);
      marker.on('dragend', moveMarker);
      map.addLayer(marker);
    } else {
      marker.setLatLng(position);
    }
    //marker.setDraggable(draggable);
  }

  var setMapType = exports.setMapType = function(id) {
    map.removeLayer(layers.get(mapType));
    map.removeLayer(layers.get('lines'));
    map.addLayer(layers.get(id));
    if(id === 'satellite' && hikingMapType === 'turistautak') {
      map.addLayer(layers.get('lines'));
    }
    mapType = id;
    saveState();
  };

  exports.getMapType = function(id) {
    return mapType; 
  };

  exports.getHikingMapType = function(id) {
    return hikingMapType;
  };

  var setHikingMapType = exports.setHikingMapType = function(id) {
    hikingMapType = id;
    saveState();
  };

  function setState(state) {
    if(state.position) {
      setMarker(state.position);
    }
    hikingMapType = state.hikingMapType;
    setMapType(state.mapType || 'turistautak');
  }

  function deserialize(state) {
    if(state.center) {
      state.center = new L.LatLng(state.center.lat, state.center.lng);
    }
    if(state.position) {
      state.position = new L.LatLng(state.position.lat, state.position.lng);
    }
  }

  function serialize() {
    var state = {
      zoom: map.getZoom(),
      center: {
        lat: map.getCenter().lat,
        lng: map.getCenter().lng
      },
      mapType: mapType,
      hikingMapType: hikingMapType
    };
    if(marker) {
      state.position = {
        lat: marker.getLatLng().lat,
        lng: marker.getLatLng().lng
      };
    }
    return state;
  }

  function saveState() {
    if(window.localStorage) {
      localStorage.turistautak = JSON.stringify(serialize());
    }
  }

  function loadStorageState() {
    var state;
    if(window.localStorage && localStorage.turistautak) {
      try {
        state = JSON.parse(localStorage.turistautak);
      } catch(e) { /* parse error, ignore it */ }
    }
    return state || {};
  }

  function loadHashState(state) {
    if(window.location.hash.length > 1) {
      var parts = window.location.hash.substring(1).split(',');
      try {
        state.center = {
          lat: parseFloat(parts[0]),
          lng: parseFloat(parts[1])
        };
        state.zoom = parseInt(parts[2], 10);
      } catch(e) { /* invalid hash, ignore it */ }
      state.position = state.center;
    }
    return state;
  }

  function saveHashState() {
    var position = marker.getLatLng();
    window.location.hash =
      roundCoordinate(position.lat) + ',' +
      roundCoordinate(position.lng) + ',' +
      map.getZoom();
  }

  function roundCoordinate(coordinate) {
    return Math.round(coordinate * 100000) / 100000;
  }

  function toggleSettings() {
    document.body.className = 
      document.body.className === 'settings' ? '' : 'settings';
  }

  initialize();

});
