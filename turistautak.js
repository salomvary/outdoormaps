var turistautak = {};

turistautak.LINES = new google.maps.ImageMapType({
	getTileUrl: function(coord, zoom) {
		return 'http://map.turistautak.hu/tiles/lines/' + zoom +
			'/' + coord.x + '/' + coord.y + '.png';
  },
  tileSize: new google.maps.Size(256, 256),
  maxZoom: 21,
  minZoom: 8
});

turistautak.DEFAULT = new google.maps.ImageMapType({
	getTileUrl: function(coord, zoom) {
		// TODO rotate a/b/c/d
		return 'http://a.map.turistautak.hu/tiles/turistautak/' + zoom +
			'/' + coord.x + '/' + coord.y + '.png';
  },
  tileSize: new google.maps.Size(256, 256),
  maxZoom: 21,
  minZoom: 8,
	name: 'Turista'
});

var locate = document.getElementById('locate');
if(navigator.geolocation) {
	locate.onclick = function() {
		navigator.geolocation.getCurrentPosition(showPosition);
	};
} else {
	locate.style.display = 'none';
}

var mapOptions = {
	center: new google.maps.LatLng(47.3, 19.5),
	zoom: 8,
	mapTypeId: 'turistautak',
	mapTypeControlOptions: {
		mapTypeIds: [
			google.maps.MapTypeId.ROADMAP,
			google.maps.MapTypeId.SATELLITE,
			google.maps.MapTypeId.TERRAIN,
			'turistautak'],
		style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
	},
	streetViewControl: false
};

function showPosition(position) {
	if(position && ! ('code' in position)) {
		map.setCenter(new google.maps.LatLng(position.coords.latitude, 
			position.coords.longitude));
		map.setZoom(18);
	}
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
