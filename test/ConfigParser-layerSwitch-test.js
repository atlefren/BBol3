/*global buster: false, bbol3: false, ol: false */
(function () {
    'use strict';

    var assert = buster.assert;
    //var refute = buster.refute;

    buster.testCase('ConfigParser layer switch test', {

        setUp: function () {

            this.minimalConfig = {
                'layers': [
                    {
                        "isBaseLayer": true,
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
                        "name": "Grunnlinje",
                        "tiled": false,
                    }
                ]
            };

            this.cp = new bbol3.ConfigParser();
        },

        'setBaseLayer replaces current baseLayer': function () {
            var callback = this.spy();
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            assert(callback.calledOnce);
            var map = callback.getCall(0).args[0];
            var layers = callback.getCall(0).args[1];

            var baseLayer = map.getLayers().item(0);
            assert.equals(layers.baseLayers[0].ollayer, baseLayer);
            this.cp.setBaseLayer(layers.baseLayers[1]);
            assert.equals(layers.baseLayers[1].ollayer, baseLayer);
        },

        'hideLayer on overlay removes it': function () {
            var callback = this.spy();
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            assert(callback.calledOnce);
            var map = callback.getCall(0).args[0];

            assert.equals(3, map.getLayers().getLength());
            var layers = callback.getCall(0).args[1];
            this.cp.hideLayer(layers.overlays[0]);
            assert.equals(2, map.getLayers().getLength());
            assert.equals(map.getLayers().item(1), layers.overlays[1].ollayer);
        },

        'addOverlay adds overlay': function () {
            this.minimalConfig.layers[3].visible = false;
            var callback = this.spy();
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            assert(callback.calledOnce);
            var map = callback.getCall(0).args[0];
            assert.equals(2, map.getLayers().getLength());

            var layers = callback.getCall(0).args[1];
            this.cp.addOverlay(layers.overlays[1]);
            assert.equals(3, map.getLayers().getLength());
            assert.equals(map.getLayers().item(2), layers.overlays[1].ollayer);
        }
    });
}());

