module.exports = {
  get: function() {
    return window.location.hash.substring(1);
  },

  set: function(path) {
    window.location.hash = path;
  }
};
