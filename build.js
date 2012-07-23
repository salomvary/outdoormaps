var AssetGraph = require('assetgraph'),
	path = require('path');

new AssetGraph({root: './'})
	.loadAssets('index.html')
	.populate({
		followRelations: {to: {url: /^file:/}},
		onError: function(err) {
			console.error('error populating', err);
		}})
	.writeStatsToStderr()
	.bundleRelations({type: ['HtmlStyle', 'HtmlScript']})
	.moveAssetsInOrder({type: ['JavaScript', 'Css', 'Png']}, function (asset) {
		return asset.url + '?' + asset.md5Hex.substr(0, 10);
	})
	.addCacheManifest()
	.writeAssetsToDisc()
	.run(function(err, graph) {
		console.log(err);
	});
