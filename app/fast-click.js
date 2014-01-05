/**
 * Fast clicks for iOS
 *
 * Adopted from:
 * http://cubiq.org/remove-onclick-delay-on-webkit-for-iphone
 */

var isAndroid = navigator.userAgent.indexOf('Android') > 0;

module.exports = function(el, options) {
  var element = el,
      moved;

  if (window.Touch && !isAndroid) {
    element.addEventListener('touchstart', onTouchStart, false);
  }

  function onTouchStart(e) {
    e.preventDefault();
    moved = false;

    element.addEventListener('touchmove', onTouchMove, false);
    element.addEventListener('touchend', onTouchEnd, false);
  }

  function onTouchMove() {
    moved = true;
  }

  function onTouchEnd(e) {
    element.removeEventListener('touchmove', onTouchMove, false);
    element.removeEventListener('touchend', onTouchEnd, false);

    if (!moved) {
      var target = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      if (target.nodeType == 3) {
        target = target.parentNode;
      }

      if (options && options.focus) {
        target.focus();
      } else {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        target.dispatchEvent(event);
      }
    }
  }
};
