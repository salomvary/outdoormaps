import * as L from 'leaflet';
import fastClick from 'fastclick';

export default {
  extend: function (dst: any, src: any): any {
    if (src) {
      for (const k in src) {
        dst[k] = src[k];
      }
    }
    return dst;
  },

  show: function (el: HTMLElement): void {
    el.style.display = 'block';
  },

  hide: function (el: HTMLElement): void {
    el.style.display = 'none';
  },

  eachNode: function <T extends Node>(
    nodeList: NodeListOf<T>,
    fn: (node: T) => void,
    context?: any
  ) {
    for (let i = 0; i < nodeList.length; i++) {
      fn.call(context, nodeList[i]);
    }
  },

  toggleClass: function (el: HTMLElement, className: string, enable: boolean) {
    const classes = el.className.split(/\s+/),
      index = classes.indexOf(className);
    if (index > -1) {
      classes.splice(index, 1);
    }
    if (enable) {
      classes.push(className);
    }
    el.className = classes.join(' ');
  },

  on: function (
    el: EventTarget,
    event: string,
    func: (e: Event) => void,
    context?: any
  ) {
    el.addEventListener(event, func.bind(context), false);
  },

  create: L.DomUtil.create,

  fastClick: fastClick.attach,
};
