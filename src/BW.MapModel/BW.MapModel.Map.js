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