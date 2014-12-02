/*global buster:false, bbol3: false */
(function () {
    "use strict";

    var assert = buster.assert;
    //var refute = buster.refute;

    buster.testCase('ConfigParser parse test', {

        setUp: function () {
            this.minimalConfig = {
                "layers": [
                    {
                        "isBaseLayer": true,
                        "source": "WMTS",
                        "url": "http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?",
                        "layername": "havbunn_grunnkart"
                    }
                ]
            };
            this.cp = new bbol3.ConfigParser();
            this.server = this.useFakeServer();
        },

        'ConfigParser should be defined': function () {
            assert(this.cp);
        },

        'should be able to parse layers from POJO': function () {
            var callback = this.spy();
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var layers = callback.getCall(0).args[1];
            assert.equals(1, layers.baseLayers.length);
            assert.equals(0, layers.overlays.length);
        },

        'should be able to parse layers from JSON.string': function () {
            var callback = this.spy();
            this.cp.setupMap(JSON.stringify(this.minimalConfig), 'map', callback);
            var layers = callback.getCall(0).args[1];
            assert.equals(1, layers.baseLayers.length);
            assert.equals(0, layers.overlays.length);
        },

        'should be able to get config via http': function () {

            this.server.respondWith(
                'GET',
                '/testfile.json',
                [
                    200,
                    {'content-type': 'application/json'},
                    JSON.stringify(this.minimalConfig)
                ]
            );
            var callback = this.spy();
            this.cp.setupMap('/testfile.json', 'map', callback);
            this.server.respond();
            assert.calledOnce(callback);
            var layers = callback.getCall(0).args[1];
            assert.equals(1, layers.baseLayers.length);
            assert.equals(0, layers.overlays.length);

        }
    });
}());

