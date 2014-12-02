/*global buster: false, bbol3: false, ol: false */
(function () {
    'use strict';

    var assert = buster.assert;
    var refute = buster.refute;

    buster.testCase('ConfigParser WMTS layer test', {

        setUp: function () {

            this.minimalConfig = {
                'extent': [0, 0, 1024, 1024],
                'numZoomLevels': 2,
                'layers': [
                     {
                        "isBaseLayer": true,
                        "source": "WMTS",
                        "url": "http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?",
                        "layername": "havbunn_grunnkart",
                        "name": "Havbunn Grunnkart"
                    }
                ]
            };
            this.cp = new bbol3.ConfigParser();
        },

        'WMTS layers are image/png by default': function () {
            var callback = this.spy();
            var sourceSpy = this.spy(ol.source, 'WMTS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = sourceSpy.getCall(0).args[0];
            assert.equals('image/png', args.format);
            sourceSpy.restore();
        },

        'WMTS format can be overridden': function () {
            this.minimalConfig.layers[0].format = 'image/jpeg';
            var callback = this.spy();
            var sourceSpy = this.spy(ol.source, 'WMTS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = sourceSpy.getCall(0).args[0];
            assert.equals('image/jpeg', args.format);
            sourceSpy.restore();
            this.minimalConfig.layers[0].format = undefined;
        },

        'WMTS layers inherits resolutions from map': function () {
            var callback = this.spy();
            var tilegridSpy = this.spy(ol.tilegrid, 'WMTS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = tilegridSpy.getCall(0).args[0];
            assert.equals([4, 2], args.resolutions);
            tilegridSpy.restore();
        },

        'WMTS layers can set own resolutions': function () {
            this.minimalConfig.layers[0].extent = [0, 0, 2048, 2048];
            var callback = this.spy();
            var tilegridSpy = this.spy(ol.tilegrid, 'WMTS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = tilegridSpy.getCall(0).args[0];
            assert.equals([8, 4], args.resolutions);
            tilegridSpy.restore();
            this.minimalConfig.layers[0].extent = undefined;
        },

        'WMTS layers calculates matrixIds from map by default': function () {
            var callback = this.spy();
            var tilegridSpy = this.spy(ol.tilegrid, 'WMTS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = tilegridSpy.getCall(0).args[0];
            assert.equals(['EPSG:32633:0', 'EPSG:32633:1'], args.matrixIds);
            tilegridSpy.restore();
        },

        'WMTS layers calculates matrixIds own values if set': function () {
            this.minimalConfig.layers[0].srid = 'EPSG:4326';
            var callback = this.spy();
            var tilegridSpy = this.spy(ol.tilegrid, 'WMTS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = tilegridSpy.getCall(0).args[0];
            assert.equals(['EPSG:4326:0', 'EPSG:4326:1'], args.matrixIds);
            tilegridSpy.restore();
            this.minimalConfig.layers[0].srid = undefined;
        }
    });
}());

