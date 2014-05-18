'use strict';

var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    watch: {
      livereload: {
        files: [
          'app/*.html',
          '{.tmp,app}{,*/}*.css',
          '{.tmp,app}{,*/}*.js',
          'app{,*/}*.{png,jpg,jpeg,webp,gif}',
          'test/*-test.js'
        ],
        // should be a separate subtask, but:
        // https://github.com/yeoman/grunt-regarde/issues/7
        tasks: ['livereload', 'furnace']
      }
    },
    furnace: {
      options: {
        importas: 'cjs',
        exportas: 'amd'
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'app/',
          src: [
            '*.js',
            'vendor/geolocation.js',
            '!app.js'
          ],
          dest: '.tmp/'
        }, {
          expand: true,
          cwd: 'test/',
          src: [
            '*-test.js'
          ],
          dest: '.tmp'
        }]
      }
    },
    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'app')
            ];
          }
        }
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test'),
              mountFolder(connect, 'app')
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: ['.tmp', 'dist/*'],
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'app/{,*/}*.js',
        '!app/vendor/*',
        'test/{,*/}*.js'
      ]
    },
    mocha: {
      all: {
        options: {
          //log: true,
          //run: true,
          urls: ['http://localhost:<%= connect.options.port %>/index.html']
        }
      }
    },
    requirejs: {
      dist: {
        // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
        options: {
          // `name` and `out` is set by grunt-usemin
          baseUrl: '.tmp',
          optimize: 'none',
          useStrict: true,
          wrap: true
        }
      }
    },
    useminPrepare: {
      html: 'app/index.html',
      options: {
        dest: 'dist'
      }
    },
    cssjoin: {
      dist: {
        options: {
          paths: ['app/']
        },
        files: {
          'dist/assets/app.css': ['app/assets/app.css']
        }
      }
    },
    rev: {
      options: {
        algorithm: 'md5',
        length: 8
      },
      assets: {
        files: [{
          src: [
            'dist/{,*/}*.{js,css,png,jpg,ico,gif}',
            'dist/vendor/require.js'
            //'dist/vendor/leaflet/images/*'
          ]
        }]
      }
    },
    usemin: {
      html: ['dist/*.html'],
      css: ['dist/{,*/}*.css'],
      options: {
        dirs: ['dist']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app',
          src: '{,*/}*.{png,jpg,jpeg,ico,gif}',
          dest: 'dist'
        }]
      }
    },
    cssmin: {
      dist: {
        files: {
          'dist/assets/app.css': [
            'dist/{,*/}*.css'
          ]
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          /*removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: 'app',
          src: '*.html',
          dest: 'dist'
        }]
      }
    },
    copy: {
      requirePrepare: {
        files: [{
          expand: true,
          cwd: 'app',
          dest: '.tmp',
          src: [
            '**/*.js'
          ]
        }]
      },
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app',
          dest: 'dist',
          src: [
            'vendor/leaflet/images/marker-*',
            '{,*/}*.{ico,txt,gif}',
            '.htaccess'
          ]
        }, {
          expand: true,
          cwd: '.',
          dest: 'dist',
          src: [
            'CNAME'
          ]
        }]
      }
    },
    manifest: {
      generate: {
        options: {
          basePath: 'dist'
        },
        src: [
          '{,*/}*.js',
          '{,*/}*.css',
          '{,*/}*.png',
          '{,*/}*.gif',
          '{,*/}*.ico',
          'vendor/*.require.js',
          'vendor/leaflet/images/*'
        ],
        dest: 'dist/index.appcache'
      }
    }
  });

  grunt.renameTask('regarde', 'watch');

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'furnace',
      'livereload-start',
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'furnace',
    'connect:test',
    //'watch',
    'mocha'
  ]);

  grunt.registerTask('testServer', [
    'clean:server',
    'furnace',
    'connect:test',
    'watch'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'copy:requirePrepare',
    'furnace',
    'requirejs',
    'imagemin',
    'htmlmin',
    'concat',
    'cssjoin',
    'cssmin',
    'uglify',
    'copy',
    'rev',
    'usemin',
    'manifest'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
};
