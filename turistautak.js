var turistautak = {};

turistautak.getTileUrl = function(type, coord, zoom) {
	// a-b-c-d subdomain sharding
	var subdomain = String.fromCharCode(97 /* 'a' */ + (zoom + coord.x + coord.y) % 4);
	return 'http://' + subdomain + '.map.turistautak.hu/tiles/' + type + '/' + zoom +
		'/' + coord.x + '/' + coord.y + '.png';
};

turistautak.defaultOptions = function() {};
turistautak.defaultOptions.prototype = {
	getTileUrl: function(coord, zoom) {
		return turistautak.getTileUrl('turistautak', coord, zoom);
  },
  tileSize: new google.maps.Size(256, 256),
  maxZoom: 21,
  minZoom: 8,
	name: 'Turista'
};

turistautak.linesOptions = function(){};
turistautak.linesOptions.prototype = new turistautak.defaultOptions();

turistautak.linesOptions.prototype.getTileUrl = function(coord, zoom) {
		return turistautak.getTileUrl('lines', coord, zoom);
};

turistautak.DEFAULT = new google.maps.ImageMapType(new turistautak.defaultOptions());
turistautak.LINES = new google.maps.ImageMapType(new turistautak.linesOptions());


var mapOptions = {
	mapTypeId: 'turistautak',
	mapTypeControlOptions: {
		mapTypeIds: [
			google.maps.MapTypeId.ROADMAP,
			google.maps.MapTypeId.SATELLITE,
			google.maps.MapTypeId.TERRAIN,
			'turistautak'],
		style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
	},
	mapTypeControl: true,
	scaleControl: true,
	panControl: false,
	streetViewControl: false,
	zoomControlOptions: {
		position: google.maps.ControlPosition.LEFT_TOP
	}
};

function showPosition(position) {
	if(position && ! ('code' in position)) {
		map.setCenter(new google.maps.LatLng(position.coords.latitude, 
			position.coords.longitude));
		map.setZoom(18);
	}
}

// saved state
if(window.localStorage) {
	if(window.localStorage.turistautak) {
		var lastState = JSON.parse(window.localStorage.turistautak);
	}
	if(lastState) {
		mapOptions.center = new google.maps.LatLng(lastState.lat, lastState.lng);
		mapOptions.zoom = lastState.zoom;
	}
	window.addEventListener('unload', saveState, false);
}

function saveState() {
	var state = {
		zoom: map.getZoom(),
		lat: map.getCenter().lat(),
		lng: map.getCenter().lng()
	};
	window.localStorage.turistautak = JSON.stringify(state);
}

// defaults
if(! mapOptions.center) {
	mapOptions.center = new google.maps.LatLng(47.3, 19.5);
	mapOptions.zoom = 8;
}

var map = new google.maps.Map(document.getElementById('map'), mapOptions);
map.mapTypes.set('turistautak', turistautak.DEFAULT);

google.maps.event.addListener(map, 'maptypeid_changed', function() {
	if(map.getMapTypeId() === google.maps.MapTypeId.SATELLITE) {
		map.overlayMapTypes.push(turistautak.LINES);
	} else {
		map.overlayMapTypes.clear();
	}
});

if(navigator.geolocation) {
	var locate = document.createElement('button');
	locate.className = 'locate';
	locate.type = 'button';
	locate.onclick = function() {
		navigator.geolocation.getCurrentPosition(showPosition);
	};
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(locate);
}
