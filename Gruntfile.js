var AssetGraph = require('assetgraph');

module.exports = function(grunt) {

  var minifiedApp = 'turistautak.min.js';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      compile: {
        options: {
          baseUrl: '.',
          mainConfigFile: 'turistautak.js',
          name: 'vendor/almond',
          include: 'turistautak',
          insertRequire: ['turistautak'],
          out: minifiedApp
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-volo');

  grunt.registerTask('assetgraph', function() {
    var done = this.async();

    new AssetGraph({root: './'})
      .loadAssets('index.html')
      .loadAssets(minifiedApp)
      .loadAssets('vendor/leaflet.js/images/*')
      .populate({
        followRelations: { to: { url: /^file:/ } },
        onError: function(err) {
          grunt.log.error('error populating aseet graph ' + err);
          done(false);
        }
      })
      .queue(function(graph) {
        // replace requirejs script tag with
        // the plain all-in-one compiled script
        var requireMain = graph.findRelations({
          type: 'HtmlRequireJsMain'
        })[0];
        var compiledScript = graph.findAssets({
          fileName: minifiedApp
        })[0];
        var compiledHtmlScript = new graph.HtmlScript({
          to: compiledScript
        });
        compiledHtmlScript.attach(requireMain.from, 'after', requireMain);
        var requireJsScript = graph.findAssets({
          fileName: 'require.js'
        })[0];
        graph.removeAsset(requireMain.to, true);
        graph.removeAsset(requireJsScript, true);
      })
      .writeStatsToStderr()
      .bundleRelations({ type: ['HtmlStyle'] })
      .moveAssetsInOrder({ type: ['JavaScript', 'Css', 'Png'] }, function (asset) {
        return asset.url + '?' + asset.md5Hex.substr(0, 10);
      })
      .addCacheManifest()
      .queue(function(graph) {
        // add marker images (referenced from js)
        // to the manifest manually
        var manifest = graph.findRelations({
          type: 'HtmlCacheManifest'
        })[0].to;
        graph.findAssets({ url: /vendor\/leaflet\.js\/images\/marker-.*/ }).forEach(function(asset) {
          new AssetGraph.CacheManifestEntry({
            sectionName: 'CACHE',
            to: asset
          }).attach(manifest, 'last');
        });
      })
      .writeAssetsToDisc()
      .run(function(err) {
        if(err) {
          grunt.log.error('error running asset graph ' + err);
          done(false);
        }
      });
  });

  grunt.registerTask('compile', [ 'requirejs:compile', 'assetgraph' ]);
  grunt.registerTask('build', [ 'volo:install', 'compile' ]);

};
