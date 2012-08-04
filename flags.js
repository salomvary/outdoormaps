var flags = ['offlineEnabled', 'doNotTrackEnabled', 'detectRetinaEnabled'],
	form = document.forms[0];

flags.forEach(function(flag) {
	form.innerHTML += '<p><label><input type="checkbox" name="'+flag+'"' + 
		(localStorage[flag] ? ' checked="checked"' : '') + '>' +
		flag + '</label></p>';
});

form.addEventListener('change', function(e) {
	if(e.target.checked) {
		localStorage[e.target.name] = true;
	} else {
		delete localStorage[e.target.name];
	}
}, false);
