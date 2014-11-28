var BW = this.BW || {};
BW.MapModel = BW.MapModel || {};

BW.MapModel.Layer = function (config) {
    'use strict';
    var defaults = {
        subLayers: [],
        name: '',
        categoryId: 0,
        visibleOnLoad: true,
        isVisible: false, // Holds current state, will be set to true on factory.Init if VisibleOnLoad = true
        isBaseLayer: false,
        previewActive: false,
        opacity: 1,
        mapLayerIndex: -1,
        legendGraphicUrls: []
    };
    var layerInstance = $.extend({}, defaults, config); // layerInstance

    var subLayers = _.map(config.subLayers, function (subLayer) {
        return new BW.MapModel.SubLayer(subLayer);
    });
    layerInstance.subLayers = subLayers;

    return layerInstance;
};