declare namespace fastclick {
  function attach (el: Element, options?: {focus: boolean}): void;
}

declare module 'fastclick' {
  export default fastclick;
}
