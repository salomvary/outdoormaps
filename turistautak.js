(function(maps) {

	var marker,
		map;

	var mapDefaults = {
		center: new maps.LatLng(47.3, 19.5),
		zoom: 8,
		mapTypeId: 'turistautak',
		mapTypeControlOptions: {
			mapTypeIds: [
				maps.MapTypeId.ROADMAP,
				maps.MapTypeId.SATELLITE,
				maps.MapTypeId.TERRAIN,
				'turistautak'],
			style: maps.MapTypeControlStyle.DROPDOWN_MENU
		},
		mapTypeControl: true,
		scaleControl: true,
		panControl: false,
		streetViewControl: false,
		zoomControlOptions: {
			position: maps.ControlPosition.LEFT_TOP
		}
	};

	initialize();

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

		map = new maps.Map(document.getElementById('map'), mapOptions);
		map.mapTypes.set('turistautak', turistautak.DEFAULT);
		updateOverlays();

		// set the rest of the state
		setState(state);

		maps.event.addListener(map, 'maptypeid_changed', updateOverlays);
		maps.event.addListener(map, 'maptypeid_changed', saveState);
		maps.event.addListener(map, 'idle', saveState);

		if(navigator.geolocation) {
			createLocateButton();
		}

	}

	function createLocateButton() {
		var locate = document.createElement('button');
		locate.className = 'locate';
		locate.type = 'button';
		maps.event.addDomListener(locate, 'click', function() {
			navigator.geolocation.getCurrentPosition(showPosition, function(error) {
				alert('Could not get your position:'+error.message);
			});
		});
		map.controls[maps.ControlPosition.TOP_LEFT].push(locate);
	}

	function showPosition(position) {
		if(position && ! ('code' in position)) {
			var center = new maps.LatLng(position.coords.latitude, 
				position.coords.longitude);
			map.setCenter(center);
			map.setZoom(18);
			setMarker(center);
			saveState();
		}
	}

	function setMarker(position) {
		if(! marker) {
			marker = new maps.Marker({
				map: map
			});
		}
		marker.setPosition(position);
	}

	function updateOverlays() {
		if(map.getMapTypeId() === maps.MapTypeId.SATELLITE) {
			map.overlayMapTypes.push(turistautak.LINES);
		} else {
			map.overlayMapTypes.clear();
		}
	}

	function setState(state) {
		if(state.position) {
			setMarker(state.position);
		}
	}

	function deserialize(state) {
		if(state.center) {
			state.center = new maps.LatLng(state.center.lat, state.center.lng);
		}
		if(state.position) {
			state.position = new maps.LatLng(state.position.lat, state.position.lng);
		}
	}

	function serialize() {
		var state = {
			zoom: map.getZoom(),
			center: {
				lat: map.getCenter().lat(),
				lng: map.getCenter().lng()
			},
			mapTypeId: map.getMapTypeId()
		};
		if(marker) {
			state.position = {
				lat: marker.getPosition().lat(),
				lng: marker.getPosition().lng()
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
			var parts = window.location.hash.substring(1).split('/');
			try {
				state.center = {
					lat: parseFloat(parts[0]),
					lng: parseFloat(parts[1])
				};
				state.zoom = parseInt(parts[2], 10);
			} catch(e) { /* invalid hash, ignore it */ }
		}
		return state;
	}

})(google.maps);
