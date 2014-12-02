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
            var params = layerConfig.options || {};
            var sourceData = {
                params: _.extend(params, {
                    LAYERS: layerConfig.layername,
                    VERSION: layerConfig.version
                }),
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

        function extendWmsConfigWithDefaults(wmsConfig) {
            var defaults = {
                format: 'image/png',
                version: '1.1.1'
            };
            if (!_.has(wmsConfig, 'tiled')) {
                wmsConfig.tiled = true;
            }
            if (!_.has(wmsConfig, 'transparent')) {
                if (wmsConfig.isBaseLayer) {
                    wmsConfig.transparent = false;
                } else {
                    wmsConfig.transparent = true;
                }
            }
            return _.extend({}, defaults, wmsConfig);
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
            return _.extend({}, defaults, wmtsConfig);
        }

        function createGeoJsonLayer(layerConfig) {
            var params = {};
            if (_.has(layerConfig, 'data')) {
                params.object = layerConfig.data;
            }
            if (_.has(layerConfig, 'url')) {
                params.url = layerConfig.url;
            }
            return new ol.layer.Vector({
                source: new ol.source.GeoJSON(params)
            });
        }

        function extendGeoJSONConfigWithDefaults(geoJsonConfig) {
            var defaults = {};
            return _.extend({}, defaults, geoJsonConfig);
        }

        var SOURCES = {
            WMTS: {
                config: extendWmtsConfigWithDefaults,
                create: createWmtsLayer
            },
            WMS: {
                config: extendWmsConfigWithDefaults,
                create: createWmsLayer
            },
            GeoJSON: {
                config: extendGeoJSONConfigWithDefaults,
                create: createGeoJsonLayer
            }
        };

        function createLayer(layerConfig) {
            if (!_.has(SOURCES, layerConfig.source)) {
                throw 'Unsupported source: "' + layerConfig.source +  '"';
            }
            var source = SOURCES[layerConfig.source];
            layerConfig = source.config(layerConfig);
            var layer = source.create(layerConfig);
            return _.extend({ollayer: layer}, layerConfig);
        }

        function hideLayer(layer) {
            map.removeLayer(layer.ollayer);
        }

        function setBaseLayer(layer) {
            layer.visible = true;
            if (currentBaseLayer) {
                hideLayer(currentBaseLayer);
            }
            map.getLayers().insertAt(0, layer.ollayer);
            currentBaseLayer = layer;
        }

        function addOverlay(layer) {
            map.addLayer(layer.ollayer);
        }

        function createResolutionsArray(config) {
            var range = _.range(1, config.numZoomLevels);
            return _.reduce(range, function (acc, i) {
                acc.push(acc[i - 1] / 2);
                return acc;
            }, [config.maxResolution]);
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
                .each(function (layer) {
                    if (_.isUndefined(layer.visible)) {
                        layer.visible = true;
                    }
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
                srid: 'EPSG:32633',
                extentUnits: 'm',
                renderer: 'canvas'
            };

            return _.extend({}, defaults, mapConfig);
        }

        function initBaseLayer(baseLayers) {
            var visible = _.filter(baseLayers, function (layer) {
                return layer.visible;
            });
            if (visible.length) {
                setBaseLayer(visible[0]);
                _.chain(visible)
                    .rest()
                    .each(function (layer) {
                        layer.visible = false;
                    });
            } else {
                setBaseLayer(baseLayers[0]);
            }
        }

        function initOverlays(overlays) {
            _.chain(overlays)
                .filter(function (layer) {
                    return layer.visible;
                })
                .each(addOverlay);
        }

        function init(mapConfig) {
            config = extendMapConfigWithDefaults(mapConfig);
            var resolutions = createResolutionsArray(config);
            var projection = createProjection(config);

            if (_.isString(mapElement)) {
                mapElement = document.getElementById(mapElement);
            }

            map = new ol.Map({
                target: mapElement,
                renderer: config.renderer,
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
            initBaseLayer(layers.baseLayers);
            initOverlays(layers.overlays);
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
