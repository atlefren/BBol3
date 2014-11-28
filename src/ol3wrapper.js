/*
    Wraps the new OpenLayers 3 "core" lib to be able to simply setup a map
    with layers based on a json-config. See ol3demo.html for example use.

*/

var BW = this.BW || {};
BW.MapCore = BW.MapCore || {};
(function (ns) {
    'use strict';

    ns.setupMap = function (mapDiv, mapConfig, callback) {
        var mapModel = new BW.MapModel.Map(map);
        function initMap(data) {
            mapModel.Init(mapDiv, data, callback);
        }
        BW.Repository.getConfig(mapConfig, initMap);
    };
}(BW.MapCore));
