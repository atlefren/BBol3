/*jslint indent: 2 */
module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: '\n'
      },
      ol3core: {
        src: [
          'src/ConfigParser.js'
        ],
        dest: 'dist/ol3core.js'
      },
      ol3listmap: {
        src: [
          'src/FeatureCollection.js',
          'src/ListMapView.js'
        ],
        dest: 'dist/ol3listmap.js'
      },
      ol3markers: {
        src: [
          'src/Ol3Markers.js'
        ],
        dest: 'dist/ol3markers.js'
      },
      ol3selectevents: {
        src: [
          'src/Ol3SelectEvents.js'
        ],
        dest: 'dist/ol3selectevents.js'
      },
      initbbmap: {
        src: [
          'src/InitBBMap.js'
        ],
        dest: 'dist/initbbmap.js'
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy HH:MM") %> */\n'
      },
      ol3core: {
        files: {
          'dist/ol3core.min.js': ['<%= concat.ol3core.dest %>']
        }
      },
      ol3listmap: {
        files: {
          'dist/ol3listmap.min.js': ['<%= concat.ol3listmap.dest %>']
        }
      },
      ol3markers: {
        files: {
          'dist/ol3markers.min.js': ['<%= concat.ol3markers.dest %>']
        }
      },
      ol3selectevents: {
        files: {
          'dist/ol3selectevents.min.js': ['<%= concat.ol3selectevents.dest %>']
        }
      },
      initbbmap: {
        files: {
          'dist/initbbmap.min.js': ['<%= concat.initbbmap.dest %>']
        }
      }
    },
    buster: {
      test: {
        server: {
          port: 1112
        }
      }
    },
    clean: {
      build: {
       src: ['dist/']
     }
    },
    build: {
      tasks: ['clean:build', 'default'],
      gitAdd: 'package.json bower.json dist/*'
    },
    sync: {
      options: {
        include: ['name', 'version', 'description', 'main', 'license']
      } 
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-buster');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-bump-build-git');
  grunt.loadNpmTasks('grunt-sync-pkg');

  grunt.registerTask('default', ['concat', 'uglify']);
  grunt.registerTask('test', ['buster']);

};
