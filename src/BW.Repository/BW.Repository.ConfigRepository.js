var BW = this.BW || {};
BW.Repository = BW.Repository || {};

(function (ns) {
    'use strict';

    function _createConfig(config) {
        var result = {
            numZoomLevels: 18,
            newMaxRes: 21664.0,
            center: [-20617, 7661666],
            zoom:  4,
            extent: [-2500000.0, 3500000.0, 3045984.0, 9045984.0],
            layers: [],
            tools: []
        };
        _.extend(result, config);
        var layers = _.map(config.layers, function (layer) {
            return new BW.MapModel.Layer(layer);
        });
        result.layers = layers;
        return result;
    }

    var MapConfig = function (config) {
        var defaults = {
            numZoomLevels: 10,
            newMaxRes: 20000,
            renderer: 'canvas',
            center: [-1, 1],
            zoom: 5,
            layers: [],
            coordinate_system: "EPSG:32633",
            extent: [-1, -1, -1, -1],
            extentunits: 'm',
            proxyHost: ""
        };
        return _.extend({}, defaults, config);
    };

    ns.getConfig = function (url, callback) {

        function parse(data) {
            var mapConfig = new MapConfig(_createConfig(data));
            callback(mapConfig);
        }

        try {
            if (_.isString(url)) {
                parse(JSON.parse(url));
            } else {
                parse(url);
            }
        } catch (e) {
            $.getJSON(url, function (data) {
                parse(data);
            });
        }
    };

}(BW.Repository));
