var JXON = require('vendor/jxon');
require('vendor/FileSaver');
/* global saveAs */

/**
 * Export LatLng coordinates as a GPX file
 *
 * Stolen from here:
 * https://github.com/mstock/osrm-frontend/blob/7bcb1b3587fb502c016daa61eae5270bca6b90bf/src/tools.js
 *
 * @param {LatLng[]} coordinates
 */
module.exports = function gpxExport(coordinates) {
  var trackPoints = coordinates.map(function(coordinate) {
    return {
      '@lat': coordinate.lat,
      '@lon': coordinate.lng
    };
  });

  var gpx = {
    'gpx': {
      '@xmlns': 'http://www.topografix.com/GPX/1/1',
      '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@xsi:schemaLocation': 'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd',
      '@version': '1.1',
      'trk': {
        'trkseg': {
          'trkpt': trackPoints
        }
      }
    }
  };

  var gpxData = JXON.stringify(gpx);
  var blob = new Blob(['<?xml version="1.0" encoding="utf-8"?>', "\n", gpxData], {
    type: 'application/gpx+xml;charset=utf-8'
  }, false);
  saveAs(blob, 'route.gpx');
};
