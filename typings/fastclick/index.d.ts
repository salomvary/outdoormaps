declare namespace fastclick {
  function attach (el: HTMLElement, options?: {focus: boolean}): void;
}

declare module 'fastclick' {
  export default fastclick;
}
