module.exports = {
  extend: function(dst, src) {
    if(src) {
      for(var k in src) {
        dst[k] = src[k];
      }
    }
    return dst;
  },

  show: function(el) {
    el.style.display = 'block';
  },

  hide: function(el) {
    el.style.display = 'none';
  },

  eachNode: function(nodeList, fn, context) {
    for(var i=0; i<nodeList.length; i++) {
      fn.call(context, nodeList[i]);
    }
  },

  toggleClass: function(el, className, enable) {
    var classes = el.className.split(/\s+/),
      index = classes.indexOf(className);
    if(index > -1) {
      classes.splice(index, 1);
    }
    if(enable) {
      classes.push(className);
    }
    el.className = classes.join(' ');
  },

  on: function(el, event, func, context) {
    el.addEventListener(event, func.bind(context), false);
  }
};
