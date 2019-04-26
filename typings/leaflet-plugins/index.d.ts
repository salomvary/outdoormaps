declare module 'leaflet-plugins/layer/vector/GPX' {
  export default class Gpx {
    public constructor(url: string, options: {async: boolean})
    public on (type: string, callback: (event: any) => void)
  }
}
