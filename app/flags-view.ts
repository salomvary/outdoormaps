var flags = ['offlineEnabled', 'doNotTrackEnabled', 'detectRetinaEnabled'],
  form = document.forms[0];

flags.forEach(function(flag) {
  form.innerHTML += '<p><label><input type="checkbox" name="' + flag + '"' +
    (localStorage[flag] ? ' checked="checked"' : '') + '>' +
    flag + '</label></p>';
});

form.addEventListener('change', function(e) {
  const target = <HTMLInputElement>e.target;
  if (target.checked) {
    localStorage[target.name] = true;
  } else {
    delete localStorage[target.name];
  }
}, false);
