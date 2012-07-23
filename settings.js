(function(exports, maps) {

var saving = document.getElementById('saving'),
	saved = document.getElementById('saved'),
	progress = saving.querySelector('progress'),
	saveButton = document.getElementById('save-button'),
	cancelButton = document.getElementById('cancel-button'),
	closeButton = document.getElementById('close-button'),
	mapTypeButtons = document.querySelectorAll('.map-type button'),
	offlineView = document.querySelector('.offline'),
	map,
	offline;

exports.initialize = function(mainMap, offlineModule) {
	map = mainMap;
	offline = offlineModule;
	hide(saving);
	hide(saved);
	updateButtons();
	maps.event.addDomListener(closeButton, 'click', close);
	maps.event.addDomListener(saveButton, 'click', saveMap);
	maps.event.addDomListener(cancelSave, 'click', cancelSave);
	maps.event.addListener(map, 'maptypeid_changed', updateButtons);
	// no event delegation on iOS Safari :(
	for(var i=0; i<mapTypeButtons.length; i++) {
		maps.event.addDomListener(mapTypeButtons.item(i), 'click', setMapType);
	}
	if(offline && offline.isSupported) {
		if(offline.hasTiles) {
			show(saved);
		}
	} else {
		hide(offlineView);
	}
};

function saveMap() {
	var promise = offline.getTiles(map, turistautak.DEFAULT,
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

function cancelSave() {
}

function setMapType(event) {
	var button = event.target;
	toggleClass(button.parentNode.querySelector('.active'), 'active', false);
	toggleClass(button, 'active', true);
	map.setMapTypeId(button.name);
}

function close() {
	toggleClass(document.body, 'settings', false);
}

function updateButtons() {
	var mapType = map.getMapTypeId();
	// show map type
	for(var i=0; i<mapTypeButtons.length; i++) {
		var button = mapTypeButtons[i];
		toggleClass(button, 'active', button.name === mapType);
	}
	// enable/disable save offline
	saveButton.disabled = mapType !== 'turistautak';
}

function show(el) {
	el.style.display = 'block';
}

function hide(el) {
	el.style.display = 'none';
}

function toggleClass(el, className, enable) {
	var classes = el.className.split(/\s+/),
		index = classes.indexOf(className);
	if(index > -1) {
		classes.splice(index, 1);
	}
	if(enable) {
		classes.push(className);
	}
	el.className = classes.join(' ');
}

})((window.settings = {}), google.maps);
