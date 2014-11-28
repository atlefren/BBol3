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
/*global ol:false */
var BW = this.BW || {};
BW.MapModel = BW.MapModel || {};

BW.MapModel.Map = function () {

    var map;
    var layers;
    var config;
    var proxyHost;

    function _getLayers() {
        if (config !== undefined) {
            return config.layers;
        }
        return [];
    }

    function getBaseLayers() {
        return _getLayers().filter(function (elem) {
            return elem.isBaseLayer === true;
        });
    }

    function getOverlayLayers() {
        return _getLayers().filter(function (elem) {
            return elem.isBaseLayer === false;
        });
    }

    function _setUpLayerIndex() {
        var layerIndex = 0;

        var baseLayers = getBaseLayers();
        var i, j, baseLayer;
        for (i = 0; i < baseLayers.length; i++) {
            baseLayer = baseLayers[i];
            for (j = 0; j < baseLayer.subLayers.length; j++) {
                baseLayer.subLayers[j].layerIndex = layerIndex;
                layerIndex++;
            }
        }

        var overlayLayers = getOverlayLayers();
        var k, l, overlayLayer;
        for (k = 0; k < overlayLayers.length; k++) {
            overlayLayer = overlayLayers[k];
            for (l = 0; l < overlayLayer.subLayers.length; l++) {
                overlayLayer.subLayers[l].layerIndex = layerIndex;
                layerIndex++;
            }
        }
    }

    function initMap(targetId, mapConfig, callback) {
        proxyHost = mapConfig.proxyHost;
        var numZoomLevels = mapConfig.numZoomLevels;
        var newMapRes = [];
        newMapRes[0] = mapConfig.newMaxRes;
        var t;
        for (t = 1; t < numZoomLevels; t++) {
            newMapRes[t] = newMapRes[t - 1] / 2;
        }
        var sm = new ol.proj.Projection({
            code: mapConfig.coordinate_system,
            extent: mapConfig.extent,
            units: mapConfig.extentUnits
        });

        map = new ol.Map({
            target: targetId,
            renderer: mapConfig.renderer,
            layers: [],
            view: new ol.View({
                projection: sm,
                center: mapConfig.center,
                zoom: mapConfig.zoom,
                resolutions: newMapRes,
                maxResolution: mapConfig.newMaxRes,
                numZoomLevels: numZoomLevels
            }),
            controls: [],
            overlays: []
        });

        if (callback) {
            callback(map);
        }
    }

    function _getVisibleBaseLayers() {
        return getBaseLayers().filter(function (elem) {
            return elem.isVisible === true;
        });
    }

    function _createLayer(bwSubLayer) {
        var layer, source;

        switch (bwSubLayer.source) {
        case BW.MapModel.SubLayer.SOURCES.wmts:
            source = new BW.MapModel.Map.WmtsSource(bwSubLayer);
            break;

        case BW.MapModel.SubLayer.SOURCES.proxyWmts:
            bwSubLayer.url = proxyHost + bwSubLayer.url;
            source = new BW.MapModel.Map.WmtsSource(bwSubLayer);
            break;

        case BW.MapModel.SubLayer.SOURCES.wms:
            source = new BW.MapModel.Map.WmsSource(bwSubLayer);
            break;
        case BW.MapModel.SubLayer.SOURCES.proxyWms:
            bwSubLayer.url = proxyHost + bwSubLayer.url;
            source = new BW.MapModel.Map.WmsSource(bwSubLayer);
            break;
        default:
            throw 'Unsupported source: BW.MapModel.SubLayer.SOURCES.\'' +
                    bwSubLayer.source +
                    '\'. For SubLayer with url ' + bwSubLayer.url +
                    ' and name ' + bwSubLayer.name + '.';
        }

        if (bwSubLayer.tiled) {
            layer = new ol.layer.Tile({
                extent: bwSubLayer.extent,
                opacity: bwSubLayer.opacity,
                source: source
            });
        } else {
            layer = new ol.layer.Image({
                extent: bwSubLayer.extent,
                opacity: bwSubLayer.opacity,
                source: source
            });
        }

        layer.layerIndex = bwSubLayer.layerIndex;
        layer.guid = bwSubLayer.id;

        return layer;
    }

    function _showBaseLayer(bwLayer) {

        var subLayers = bwLayer.subLayers;
        var j, bwSubLayer, layer;
        for (j = 0; j < subLayers.length; j++) {
            bwSubLayer = subLayers[j];
            layer = _createLayer(bwSubLayer);
            map.getLayers().insertAt(0, layer);
        }

        bwLayer.isVisible = true;
    }

    function setBaseLayer(bwLayer) {
        _showBaseLayer(bwLayer);
    }

    function init(targetId, mapConfig, callback) {
        config = mapConfig;
        layers = mapConfig.layers;

        initMap(targetId, mapConfig, callback);

        _setUpLayerIndex();

        var baseLayers = getBaseLayers();
        var i, baseLayer;
        for (i = 0; i < baseLayers.length; i++) {
            baseLayer = baseLayers[i];
            if (baseLayer.visibleOnLoad) {
                setBaseLayer(baseLayer);
            }
        }
    }

    function getFirstVisibleBaseLayer() {
        return _getVisibleBaseLayers()[0];
    }

    function getLayerById(id) {
        var i, layer;
        for (i = 0; i < layers.length; i++) {
            layer = layers[i];
            if (layer.id === id) {
                return layer;
            }
        }
    }


    return {
        Init: init,
        GetOverlayLayers: getOverlayLayers,
        GetBaseLayers: getBaseLayers,
        GetLayerById: getLayerById,
        GetFirstVisibleBaseLayer: getFirstVisibleBaseLayer,
        SetBaseLayer: setBaseLayer
    };
};

BW.MapModel.Map.WmtsSource = function (bwSubLayer) {
    var projection = new ol.proj.Projection({
        code: bwSubLayer.coordinate_system,
        extent: bwSubLayer.extent,
        units: bwSubLayer.extentUnits
    });

    var projectionExtent = projection.getExtent();
    var size = ol.extent.getWidth(projectionExtent) / 256;
    var resolutions = new Array(14);
    var matrixIds = new Array(14);
    var numZoomLevels = 18;
    var z;
    for (z = 0; z < numZoomLevels; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = projection.getCode() + ':' + z;
    }

    return new ol.source.WMTS({
        url: bwSubLayer.url,
        layer: bwSubLayer.name,
        format: bwSubLayer.format,
        projection: projection,
        matrixSet: bwSubLayer.coordinate_system,
        crossOrigin: 'anonymous',
        tileGrid: new ol.tilegrid.WMTS({
            origin: ol.extent.getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds
        })
    });
};

BW.MapModel.Map.WmsSource = function (bwSubLayer) {
    if (bwSubLayer.tiled) {
        return new ol.source.TileWMS({
            params: {
                LAYERS: bwSubLayer.name,
                VERSION: '1.1.1'
            },
            url: bwSubLayer.url,
            format: bwSubLayer.format,
            crossOrigin: 'anonymous',
            transparent: bwSubLayer.transparent
        });
    }
    return new ol.source.ImageWMS({
        params: {
            LAYERS: bwSubLayer.name,
            VERSION: '1.1.1'
        },
        url: bwSubLayer.url,
        format: bwSubLayer.format,
        crossOrigin: 'anonymous',
        transparent: bwSubLayer.transparent
    });

};
var BW = BW || {};
BW.MapModel = BW.MapModel || {};

BW.MapModel.SubLayer = function(config){
    var defaults = {
        name: '',
        source: BW.MapModel.SubLayer.SOURCES.wmts,
        url: '',
        format: BW.MapModel.SubLayer.FORMATS.imagepng,
        coordinate_system: '',
        extent: [-1, 1, -1, 1],
        extentUnits: 'm',
        transparent: true,
        layerIndex: -1,        
        isQueryable: true
    };
    var instance =  $.extend({}, defaults, config); // subLayerInstance

    return instance;
};

BW.MapModel.SubLayer.SOURCES = {
    wmts: "WMTS",
    wms: "WMS",
    vector: "VECTOR",
    proxyWmts: "proxyWmts",
    proxyWms: "proxyWms"
};

BW.MapModel.SubLayer.FORMATS = {
    imagepng: "image/png",
    imagejpeg: "image/jpeg"
};
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
