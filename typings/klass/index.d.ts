declare module 'klass' {
  interface ClassExtendOptions {
    initialize?: Function;
    [prop: string]: any;
  }

  export default function extend(options: ClassExtendOptions): any;
}
