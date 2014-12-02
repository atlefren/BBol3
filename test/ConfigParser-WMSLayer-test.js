/*global buster: false, bbol3: false, ol: false */
(function () {
    'use strict';

    var assert = buster.assert;
    var refute = buster.refute;

    buster.testCase('ConfigParser WMS layer test', {

        setUp: function () {

            this.minimalConfig = {
                'layers': [
                    {
                        "isBaseLayer": true,
                        "source": "WMS",
                        "url": "http://wms.geonorge.no/skwms1/wms.nmg?",
                        "layername": "Norges_okonomiske_sone",
                        "name": "Norges økonomiske sone"
                    }
                ]
            };

            this.cp = new bbol3.ConfigParser();
        },

        'WMS layers should be tiled by default': function () {
            var imageSpy = this.spy(ol.layer, 'Image');
            var tileSpy = this.spy(ol.layer, 'Tile');
            var imageSourceSpy = this.spy(ol.source, 'ImageWMS');
            var tileSourceSpy = this.spy(ol.source, 'TileWMS');


            var callback = this.spy();
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            assert(callback.calledOnce);

            refute(imageSpy.called);
            assert(tileSpy.called);

            refute(imageSourceSpy.called);
            assert(tileSourceSpy.called);

            imageSpy.restore();
            tileSpy.restore();
            imageSourceSpy.restore();
            tileSourceSpy.restore();
        },

        'WMS layers cal be set to untiled': function () {
            var imageSpy = this.spy(ol.layer, 'Image');
            var tileSpy = this.spy(ol.layer, 'Tile');
            var imageSourceSpy = this.spy(ol.source, 'ImageWMS');
            var tileSourceSpy = this.spy(ol.source, 'TileWMS');

            this.minimalConfig.layers[0].tiled = false;
            var callback = this.spy();
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            assert(callback.calledOnce);

            assert(imageSpy.called);
            refute(tileSpy.called);

            assert(imageSourceSpy.called);
            refute(tileSourceSpy.called);

            imageSpy.restore();
            tileSpy.restore();
            imageSourceSpy.restore();
            tileSourceSpy.restore();
            this.minimalConfig.layers[0].tiled = true;
        },

        'WMS layers as background are not transparent by default': function () {
            var callback = this.spy();
            var tileSourceSpy = this.spy(ol.source, 'TileWMS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = tileSourceSpy.getCall(0).args[0];
            refute(args.transparent);
            tileSourceSpy.restore();
        },

        'WMS layers as overlay are transparent by default': function () {
            this.minimalConfig.layers[0].isBaseLayer = false;
            var callback = this.spy();
            var tileSourceSpy = this.spy(ol.source, 'TileWMS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = tileSourceSpy.getCall(0).args[0];
            assert(args.transparent);
            tileSourceSpy.restore();
            this.minimalConfig.layers[0].isBaseLayer = true;
        },

        'WMS layers as baseLayers can be set transparent': function () {
            this.minimalConfig.layers[0].transparent = true;
            var callback = this.spy();
            var tileSourceSpy = this.spy(ol.source, 'TileWMS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = tileSourceSpy.getCall(0).args[0];
            assert(args.transparent);
            tileSourceSpy.restore();
            this.minimalConfig.layers[0].transparent = undefined;
        },

        'WMS layers as overlays can be set to not transparent': function () {
            this.minimalConfig.layers[0].transparent = false;
            this.minimalConfig.layers[0].isBaseLayer = false;
            var callback = this.spy();
            var tileSourceSpy = this.spy(ol.source, 'TileWMS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = tileSourceSpy.getCall(0).args[0];
            refute(args.transparent);
            tileSourceSpy.restore();
            this.minimalConfig.layers[0].transparent = undefined;
            this.minimalConfig.layers[0].isBaseLayer = true;
        },

        'WMS layers has version 1.1.1 by default': function () {
            var callback = this.spy();
            var tileSourceSpy = this.spy(ol.source, 'TileWMS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = tileSourceSpy.getCall(0).args[0];
            assert.equals('1.1.1', args.params.VERSION);
            tileSourceSpy.restore();
        },

        'WMS version 1.1.1 can be overridden': function () {
            this.minimalConfig.layers[0].version = '1.3.0';
            var callback = this.spy();
            var tileSourceSpy = this.spy(ol.source, 'TileWMS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = tileSourceSpy.getCall(0).args[0];
            assert.equals('1.3.0', args.params.VERSION);
            tileSourceSpy.restore();
            this.minimalConfig.layers[0].version = undefined;
        },

        'WMS layers are image/png by default': function () {
            var callback = this.spy();
            var tileSourceSpy = this.spy(ol.source, 'TileWMS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = tileSourceSpy.getCall(0).args[0];
            assert.equals('image/png', args.format);
            tileSourceSpy.restore();
        },

        'WMS format can be overridden': function () {
            this.minimalConfig.layers[0].format = 'image/jpeg';
            var callback = this.spy();
            var tileSourceSpy = this.spy(ol.source, 'TileWMS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = tileSourceSpy.getCall(0).args[0];
            assert.equals('image/jpeg', args.format);
            tileSourceSpy.restore();
            this.minimalConfig.layers[0].format = undefined;
        },

        'WMS layer can get more params': function () {
            this.minimalConfig.layers[0].options = {'BGCOLOR': '#fff'};
            var callback = this.spy();
            var tileSourceSpy = this.spy(ol.source, 'TileWMS');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var args = tileSourceSpy.getCall(0).args[0];
            assert.equals('#fff', args.params.BGCOLOR);
            tileSourceSpy.restore();
            this.minimalConfig.layers[0].options = undefined;
        }
    });
}());

