(function(exports, maps) {

var saving = document.getElementById('saving'),
	saved = document.getElementById('saved'),
	progress = saving.querySelector('progress'),
	saveButton = document.getElementById('save-button'),
	cancelButton = document.getElementById('cancel-button'),
	map,
	offline;

exports.initialize = function(mainMap, offlineModule) {
	map = mainMap;
	offline = offlineModule;
	hide(saving);
	hide(saved);
	maps.event.addDomListener(saveButton, 'click', saveMap);
	maps.event.addDomListener(cancelSave, 'click', cancelSave);
	if(offline.hasTiles) {
		show(saved);
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

function show(el) {
	el.style.display = 'block';
}

function hide(el) {
	el.style.display = 'none';
}

})((window.settings = {}), google.maps);
