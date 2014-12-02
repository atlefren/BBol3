/*global ol:false */
var bbol3 = this.bbol3 || {};

(function (ns) {
    'use strict';

    ns.ConfigParser = function () {

        var map;
        var config;
        var mapElement;
        var createdCallback;
        var currentBaseLayer;

        function getFromConfigOrMapConfig(givenConfig, attr) {
            if (_.has(givenConfig, attr)) {
                return givenConfig[attr];
            }
            return config[attr];
        }

        function createProjection(config) {
            return new ol.proj.Projection({
                code: getFromConfigOrMapConfig(config, 'srid'),
                extent: getFromConfigOrMapConfig(config, 'extent'),
                units: getFromConfigOrMapConfig(config, 'extentUnits')
            });
        }

        function createWmsLayer(layerConfig) {
            var sourceData = {
                params: {
                    LAYERS: layerConfig.layername,
                    VERSION: layerConfig.version
                },
                url: layerConfig.url,
                format: layerConfig.format,
                crossOrigin: 'anonymous',
                transparent: layerConfig.transparent
            };

            var source;
            if (layerConfig.tiled) {
                source = new ol.source.TileWMS(sourceData);
            } else {
                source = new ol.source.ImageWMS(sourceData);
            }

            var layerData = {
                extent: getFromConfigOrMapConfig(layerConfig, 'extent'),
                source: source
            };
            if (layerConfig.tiled) {
                return new ol.layer.Tile(layerData);
            }
            return new ol.layer.Image(layerData);
        }

        var layerDefaults = {
            visible: true
        };

        function extendWmsConfigWithDefaults(wmsConfig) {
            var defaults = {
                format: 'image/png',
                transparent: true,
                version: '1.1.1'
            };
            if (!_.has(wmsConfig, 'tiled')) {
                wmsConfig.tiled = true;
            }
            return _.extend({}, layerDefaults, defaults, wmsConfig);
        }

        function createWmtsLayer(layerConfig) {
            function createMatrixIds(numZoomLevels, projection) {
                var code = projection.getCode();
                return _.map(_.range(numZoomLevels), function (i) {
                    return code + ':' + i;
                });
            }

            function createResolutions(numZoomLevels, projection) {
                var size = ol.extent.getWidth(projection.getExtent()) / 256;
                return _.map(_.range(numZoomLevels), function (i) {
                    return size / Math.pow(2, i);
                });
            }

            var projection = createProjection(layerConfig);

            var projectionExtent = projection.getExtent();
            var numZoomLevels = config.numZoomLevels;
            var resolutions = createResolutions(numZoomLevels, projection);
            var matrixIds = createMatrixIds(numZoomLevels, projection);

            var source = new ol.source.WMTS({
                url: layerConfig.url,
                layer: layerConfig.layername,
                format: layerConfig.format,
                projection: projection,
                matrixSet: getFromConfigOrMapConfig(layerConfig, 'srid'),
                crossOrigin: 'anonymous',
                tileGrid: new ol.tilegrid.WMTS({
                    origin: ol.extent.getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds
                })
            });

            return new ol.layer.Tile({
                extent: getFromConfigOrMapConfig(layerConfig, 'extent'),
                source: source
            });
        }

        function extendWmtsConfigWithDefaults(wmtsConfig) {
            var defaults = {
                format: 'image/png'
            };
            return _.extend({}, layerDefaults, defaults, wmtsConfig);
        }

        function createLayer(layerConfig) {
            var layer;
            switch (layerConfig.source) {
            case 'WMTS':
                layerConfig = extendWmtsConfigWithDefaults(layerConfig);
                layer = createWmtsLayer(layerConfig);
                break;
            case 'WMS':
                layerConfig = extendWmsConfigWithDefaults(layerConfig);
                layer = createWmsLayer(layerConfig);
                break;
            default:
                throw 'Unsupported source';
            }
            return {
                ollayer: layer,
                name: layerConfig.name,
                visible: layerConfig.visible
            };
        }

        function hideLayer(layer) {
            map.removeLayer(layer.ollayer);
        }

        function setBaseLayer(layer) {
            layer.selected = true;
            if (currentBaseLayer) {
                hideLayer(currentBaseLayer);
            }            
            map.getLayers().insertAt(0, layer.ollayer);
            currentBaseLayer = layer;
        }

        function addOverlay(layer) {
            map.addLayer(layer.ollayer);
        }

        function createResolutions(config) {
            var newMapRes = [];
            newMapRes[0] = config.maxResolution;
            var t;
            for (t = 1; t < config.numZoomLevels; t++) {
                newMapRes[t] = newMapRes[t - 1] / 2;
            }
            return newMapRes;
        }

        function createLayers(config) {
            var baseLayers = _.chain(config.layers)
                .filter(function (layer) {
                    return layer.isBaseLayer;
                })
                .map(createLayer)
                .value();
            var overlays = _.chain(config.layers)
                .filter(function (layer) {
                    return !layer.isBaseLayer;
                })
                .map(createLayer)
                .value();
            return {
                baseLayers: baseLayers,
                overlays: overlays
            };
        }

        function extendMapConfigWithDefaults(mapConfig) {
            var defaults = {
                numZoomLevels: 18,
                maxResolution: 21664.0,
                extent: [-2500000.0, 3500000.0, 3045984.0, 9045984.0],
                center: [-20617, 7661666],
                zoom: 2,
                'srid': 'EPSG:32633',
                'extentUnits': 'm',
            };

            return _.extend({}, mapConfig, defaults);
        }

        function init(mapConfig) {
            config = extendMapConfigWithDefaults(mapConfig);
            var resolutions = createResolutions(config);
            var projection = createProjection(config);
            map = new ol.Map({
                target: mapElement,
                renderer: mapConfig.renderer,
                layers: [],
                view: new ol.View({
                    projection: projection,
                    center: config.center,
                    zoom: config.zoom,
                    resolutions: resolutions,
                    maxResolution: config.maxResolution,
                    numZoomLevels: config.numZoomLevels
                }),
                overlays: []
            });

            var layers = createLayers(config);
            //set the first base layer visible            
            setBaseLayer(layers.baseLayers[0]);
            _.chain(layers.overlays)
                .filter(function (layer) {
                    return layer.visible;
                })
                .each(addOverlay);

            if (createdCallback) {
                createdCallback(map, layers);
            }
        }

        function getConfig(url, callback) {
            try {
                if (_.isString(url)) {
                    callback(JSON.parse(url));
                } else {
                    callback(url);
                }
            } catch (e) {
                $.getJSON(url, function (data) {
                    callback(data);
                });
            }
        }

        function setupMap(mapConfig, element, callback) {
            mapElement = element;
            createdCallback = callback;
            getConfig(mapConfig, init);
        }

        return {
            setupMap: setupMap,
            setBaseLayer: setBaseLayer,
            addOverlay: addOverlay,
            hideLayer: hideLayer
        };
    };

}(bbol3));
