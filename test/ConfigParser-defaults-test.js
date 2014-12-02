/*global buster: false, bbol3: false, ol: false */
(function () {
    'use strict';

    var assert = buster.assert;
    //var refute = buster.refute;

    buster.testCase('ConfigParser defaults test', {

        setUp: function () {

            this.minimalConfig = {
                'layers': [
                    {
                        'isBaseLayer': true,
                        'source': 'WMTS',
                        'url': 'http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?',
                        'layername': 'havbunn_grunnkart'
                    }
                ]
            };
            this.cp = new bbol3.ConfigParser();
        },

        'should use default params to map': function () {
            var spy = this.spy(ol, 'Map');
            var callback = this.spy();
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            assert(callback.calledOnce);
            var mapArgs = spy.getCall(0).args[0];
            assert.equals(null, mapArgs.target); //is passed through documentGetElementByid
            assert.equals('canvas', mapArgs.renderer);
            spy.restore();
        },

        'should use default params to map view': function () {
            var spy = this.spy(ol, 'View');
            var callback = this.spy();
            this.cp.setupMap(this.minimalConfig, 'map', callback);
            assert(callback.calledOnce);
            var mapViewArgs = spy.getCall(0).args[0];
            assert.equals([-20617, 7661666], mapViewArgs.center);
            assert.equals(2, mapViewArgs.zoom);
            assert.equals(21664.0, mapViewArgs.maxResolution);
            assert.equals(18, mapViewArgs.numZoomLevels);
            spy.restore();
        },

        'should get dom element for target': function () {
            var stub = this.stub(document, 'getElementById');
            stub.withArgs('map2').returns(null);
            var callback = this.spy();
            this.cp.setupMap(this.minimalConfig, 'map2', callback);
            var map = callback.getCall(0).args[0];
            assert.equals(null, map.getTarget());
            stub.restore();
        },

        'should be able to override default params to map view': function () {
            var spy = this.spy(ol, 'View');
            var callback = this.spy();
            var config = _.clone(this.minimalConfig);
            config.center = [1, 1];
            config.zoom = 0;
            config.maxResolution = 10;
            config.numZoomLevels = 11;
            this.cp.setupMap(config, 'map', callback);
            assert(callback.calledOnce);
            var mapViewArgs = spy.getCall(0).args[0];
            assert.equals(mapViewArgs.center, [1, 1]);
            assert.equals(mapViewArgs.zoom, 0);
            assert.equals(mapViewArgs.maxResolution, 10);
            assert.equals(mapViewArgs.numZoomLevels, 11);
            spy.restore();
        },

        'should be able to compute resolutions': function () {
            var spy = this.spy(ol, 'View');
            var callback = this.spy();
            var config = _.clone(this.minimalConfig);
            config.maxResolution = 100;
            config.numZoomLevels = 2;
            this.cp.setupMap(config, 'map', callback);
            assert(callback.calledOnce);
            var mapViewArgs = spy.getCall(0).args[0];
            assert.equals([100, 50], mapViewArgs.resolutions);
            spy.restore();
        },

        'should be able to create a projection': function () {
            var spy = this.spy(ol, 'View');
            var callback = this.spy();
            var config = _.clone(this.minimalConfig);
            config.maxResolution = 100;
            config.numZoomLevels = 2;
            this.cp.setupMap(config, 'map', callback);
            assert(callback.calledOnce);
            var mapViewArgs = spy.getCall(0).args[0];
            var projection = mapViewArgs.projection;
            assert.equals('EPSG:32633', projection.getCode());
            assert.equals([-2500000.0, 3500000.0, 3045984.0, 9045984.0], projection.getExtent());
            assert.equals('m', projection.getUnits());
            spy.restore();
        }
    });
}());

