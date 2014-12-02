var config = module.exports;
var fs = require('fs');

config['Njord Browser tests'] = {
    env: 'browser',
    rootPath: '../',
    libs: [
        'lib/jquery/dist/jquery.js',
        'lib/underscore/underscore-min.js',
        'lib/backbone/backbone.js',
        'lib/ol3/ol.js'
    ],
    sources: [
        'src/*.js'
    ],
    tests: [
        'test/*-test.js'
    ]
};
