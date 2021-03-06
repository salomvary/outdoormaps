import JXON from 'jxon';
import { saveAs } from 'file-saver';

/**
 * Export LatLng coordinates as a GPX file
 *
 * Stolen from here:
 * https://github.com/mstock/osrm-frontend/blob/7bcb1b3587fb502c016daa61eae5270bca6b90bf/src/tools.js
 *
 * @param {LatLng[]} coordinates
 */
export default function gpxExport(coordinates: L.LatLng[]) {
  const trackPoints = coordinates.map(function (coordinate) {
    return {
      $lat: coordinate.lat,
      $lon: coordinate.lng,
    };
  });

  const gpx = {
    gpx: {
      $xmlns: 'http://www.topografix.com/GPX/1/1',
      '$xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '$xsi:schemaLocation':
        'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd',
      $version: '1.1',
      trk: {
        trkseg: {
          trkpt: trackPoints,
        },
      },
    },
  };

  const gpxData = JXON.stringify(gpx);
  const blob = new Blob(
    ['<?xml version="1.0" encoding="utf-8"?>', '\n', gpxData],
    {
      type: 'application/gpx+xml;charset=utf-8',
    }
  );
  saveAs(blob, 'route.gpx');
}
