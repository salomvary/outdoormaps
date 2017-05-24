/*
 * TileLayer to display Ordnance Survey maps.
 * From: https://github.com/rob-murray/os-leaflet
 *
 * Modifications 2016 Dominique Cavailhez
 * https://github.com/Dominique92
 *
 * Supported only on Leaflet V1.0
 * For Leaflet V0.7 use https://github.com/rob-murray/os-leaflet
 *
 * Valid call:
	new L.TileLayer.WMS.OS({k:'OS_KEY'})
 */

// OSGB 1936 / British National Grid
L.CRS.EPSG27700 = L.extend(
	new L.Proj.CRS(
		'EPSG:27700',
		'+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs', {
			resolutions: [2500, 1000, 500, 200, 100, 50, 25, 10, 5, 2.5]
		}
	), {
		distance: function(a, b) {
			return L.CRS.Earth.distance(a, b);
		}
	}
);

L.TileLayer.WMS.OS = L.TileLayer.WMS.extend({

	initialize: function(options) {
		L.TileLayer.WMS.prototype.initialize.call(this,
			'//openspace.ordnancesurvey.co.uk/osmapapi/ts', {
				crs: L.CRS.EPSG27700,
				maxZoom: 14,
				minZoom: 0,
				tileSize: 200,
//				continuousWorld: true,
//				worldCopyJump: false,
//				tms: true,
//				detectRetina: false,
				attribution: '&copy; <a href="https://www.ordnancesurvey.co.uk/osmaps/">Ordnance Survey</a>.'
			},
			options
		);
		this.wmsParams = {
			KEY: options.k,
			FORMAT: 'image/png',
			REQUEST: 'GetMap',
			WIDTH: this.options.tileSize,
			HEIGHT: this.options.tileSize
		};
	},

	/**
	 * Return a url for this tile.
	 * Calculate the bbox for the tilePoint and format the wms request
	 */
	getTileUrl: function(tilePoint) { // (Point, Number) -> String
		var resolutionMpp = this.options.crs.options.resolutions[tilePoint.z],
			tileSizeMetres = this.options.tileSize * resolutionMpp,
			tileBboxX0 = tileSizeMetres * tilePoint.x,
			tileBboxY0 = tileSizeMetres * (-1 - tilePoint.y); // TODO: Is there a missing transformation ? tilePoint appears to be topLeft in this config

		/* service is a tile based wms format and only requires x0,y0 */
		this.wmsParams.BBOX = [tileBboxX0, tileBboxY0, 0, 0].join(',');
		this.wmsParams.LAYERS = resolutionMpp;

		return this._url + L.Util.getParamString(this.wmsParams);
	}
});
