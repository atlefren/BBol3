/*global buster: false, bbol3: false, ol: false */
(function () {
    'use strict';

    var assert = buster.assert;
    var refute = buster.refute;

    buster.testCase('ConfigParser WMTS layer test', {

        setUp: function () {

            this.server = this.useFakeServer();

            this.geoJSONData = {"type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": {"type": "Point", "coordinates": [102.0, 0.5]}, "properties": {"prop0": "value0"}}]};
            this.minimalConfig = {
                'extent': [0, 0, 1024, 1024],
                'numZoomLevels': 2,
                'layers': [
                     {
                        "isBaseLayer": true,
                        "source": "GeoJSON",
                        "data": this.geoJSONData
                    }
                ]
            };
            this.cp = new bbol3.ConfigParser();
        },

        'should be able to add a GeoJSON Layer with data': function () {
            var callback = this.spy();
            var sourceSpy = this.spy(ol.source, 'GeoJSON');
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            assert(sourceSpy.called);
            var args = sourceSpy.getCall(0).args[0];
            assert.equals(this.geoJSONData, args.object);
        },

        'should add features to map': function () {
            var callback = this.spy();
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            var map = callback.getCall(0).args[0];
            var layer = map.getLayers().item(0);
            assert.equals(1, layer.getSource().getFeatures().length);
        },

        'should be able to fetch geoJSON from url': function () {
             this.server.respondWith(
                'GET',
                '/test.geojson',
                [
                    200,
                    {'content-type': 'application/json'},
                    JSON.stringify(this.geoJSONData)
                ]
            );
            this.minimalConfig.layers[0].data = undefined;
            this.minimalConfig.layers[0].url = '/test.geojson';
            var callback = this.spy();
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            this.server.respond();
            var map = callback.getCall(0).args[0];
            var layer = map.getLayers().item(0);
            assert.equals(1, layer.getSource().getFeatures().length);
        }
    });
}());

