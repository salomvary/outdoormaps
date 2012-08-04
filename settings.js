(function(exports) {

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
	closeButton.addEventListener('click', close, false);
	saveButton.addEventListener('click', saveMap, false);
	//cancelSave.addEventListener('click', cancelSave, false);
	// no event delegation on iOS Safari :(
	for(var i=0; i<mapTypeButtons.length; i++) {
		mapTypeButtons.item(i).addEventListener('click', setMapType, false);
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
	app.setMapType(button.name);
}

function close() {
	toggleClass(document.body, 'settings', false);
}

function updateButtons() {
	var mapType = app.getMapType();
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

window.isEnabled = function(flag) {
	return window.localStorage && localStorage[flag + 'Enabled'];
};

})((window.settings = {}));
