/*global buster: false, bbol3: false, ol: false */
(function () {
    'use strict';

    var assert = buster.assert;
    //var refute = buster.refute;

    buster.testCase('ConfigParser layerDefaults test', {

        setUp: function () {

            this.minimalConfig = {
                'layers': [
                    {
                        'isBaseLayer': true,
                        'source': 'WMTS',
                        'url': 'http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?',
                        'layername': 'havbunn_grunnkart'
                    },
                    {
                        "isBaseLayer": true,
                        "source": "WMTS",
                        "url": "http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?",
                        "layername": "norges_grunnkart",
                        "name": "Norges Grunnkart"
                    }
                ]
            };

            this.configWithOverlays = {
                'layers': [
                    {
                        'isBaseLayer': true,
                        'source': 'WMTS',
                        'url': 'http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?',
                        'layername': 'havbunn_grunnkart'
                    },
                    {
                        "isBaseLayer": true,
                        "source": "WMTS",
                        "url": "http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?",
                        "layername": "norges_grunnkart",
                        "name": "Norges Grunnkart"
                    },
                    {
                        "isBaseLayer": false,
                        "source": "WMS",
                        "url": "http://wms.geonorge.no/skwms1/wms.nmg?",
                        "layername": "Norges_okonomiske_sone",
                        "name": "Norges økonomiske sone",
                        "tiled": false,
                    },
                    {
                        "isBaseLayer": false,
                        "source": "WMS",
                        "url": "http://wms.geonorge.no/skwms1/wms.nmg?",
                        "layername": "Grunnlinje",
                        "visible": false,
                        "name": "Grunnlinje",
                        "tiled": false,
                    }
                ]
            };

            this.cp = new bbol3.ConfigParser();
        },

        'should create all layers on init': function () {
            var callback = this.spy();
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            assert(callback.calledOnce);
            var map = callback.getCall(0).args[0];
            var layers = callback.getCall(0).args[1];

            assert.equals(2, layers.baseLayers.length);
            assert.equals(1, map.getLayers().getLength());
        },

        'should set first base layer as base layer if none has visible=true': function () {
            var callback = this.spy();
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            assert(callback.calledOnce);
            var map = callback.getCall(0).args[0];
            var layers = callback.getCall(0).args[1];

            var baseLayer = map.getLayers().item(0);
            assert.equals(layers.baseLayers[0].ollayer, baseLayer);
        },

        'should set first base layer with visible=true as base layer': function () {
            var callback = this.spy();
            var config = _.clone(this.minimalConfig);
            config.layers[1].visible = true;
            this.cp.setupMap(config, 'map', callback);
            assert(callback.calledOnce);
            var map = callback.getCall(0).args[0];
            var layers = callback.getCall(0).args[1];

            var baseLayer = map.getLayers().item(0);
            assert.equals(layers.baseLayers[1].ollayer, baseLayer);
        },

        'overlays should be shown by default': function () {
            var callback = this.spy();
            this.cp.setupMap(this.configWithOverlays, 'map', callback);
            assert(callback.calledOnce);
            var map = callback.getCall(0).args[0];
            var layers = callback.getCall(0).args[1];
            assert.equals(2, layers.overlays.length);
            assert.equals(2, map.getLayers().getLength());
        },

        'overlays should not be added to map when visible=false': function () {
            var callback = this.spy();
            this.configWithOverlays.layers[2].visible = false;
            this.cp.setupMap(this.configWithOverlays, 'map', callback);
            assert(callback.calledOnce);
            var map = callback.getCall(0).args[0];
            var layers = callback.getCall(0).args[1];
            assert.equals(2, layers.overlays.length);
            assert.equals(1, map.getLayers().getLength());
        },

        'layers are by default overlays': function () {
            var callback = this.spy();
            this.configWithOverlays.layers.push({
                "source": "WMS",
                "url": "http://wms.geonorge.no/skwms1/wms.nmg?",
                "layername": "Norges_okonomiske_sone2"
            });
            this.cp.setupMap(this.configWithOverlays, 'map', callback);
            assert(callback.calledOnce);
            var map = callback.getCall(0).args[0];
            var layers = callback.getCall(0).args[1];
            assert.equals(2, layers.baseLayers.length);
            assert.equals(3, layers.overlays.length);
            this.configWithOverlays.layers.pop();
        }
    });
}());

