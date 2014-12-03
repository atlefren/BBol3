/*global ol: false */

/*
    Sets up a marker style (based on provided markers) with an optional zIndex.

    Usage:
    var markerCreator = new bbol3.MapCore.Markers('/path/to/markers/folder');
    var myMarker = markerCreator.createMarkerStyle('red', 'md'); //creates a medium red marker
    var myMarker = markerCreator.createMarkerStyle('green', 'sm', 1000); //creates a large green marker with z-index 1000

    Use the createMarkerStyleDict in the same fashion to get a POJO (ie not wrapped i ol.styleStyle).
    This is useful for creating more complicated rules and such.

    For available colors, see the COLORS array below.
    For available markers, see the img/markers folder
    There are three sizes:
        - sm (small)  (23x28 px)
        - md (medium) (33x40 px)
        - lg (large)  (44x56 px)

*/

var bbol3 = this.bbol3 || {};
bbol3.Markers = function (imgUrl) {
    'use strict';

    //these colors corresponds to the ones used in the markers
    var COLORS = {
        'black':    '#000000',
        'blue':     '#085382',
        'grey':     '#4C4C4E',
        'green':    '#118208',
        'orange':   '#F05A28',
        'red':      '#D72323',
        'sea':      '#0C969B',
        'sky':      '#76C2D2',
        'yellow':   '#F0BA28'
    };

    //get the hex-code for a color
    function getColor(color) {
        if (COLORS[color]) {
            return COLORS[color];
        }
        return color;
    }

    //include z-Index in the style dict
    function zIndexWrap(styleDict, zIndex) {
        if (zIndex) {
            styleDict.zIndex = zIndex;
        }
        return styleDict;
    }


    //get a filename for a marker
    function getMarkerFilename(color, size) {
        var validSize = (['sm', 'md', 'lg'].indexOf(size) !== -1);
        var validColor = (_.keys(COLORS).indexOf(color) !== -1);
        if (!validColor) {
            throw new Error(
                'Color "' + color + '"" is not supported!'
            );
        }
        if (!validSize) {
            throw new Error(
                'Size "' + size + '"" is not supported!'
            );
        }
        return 'pin-' + size + '-' + color + '.png';
    }


    function createMarkerStyleDict(color, size, zIndex) {
        return zIndexWrap({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: imgUrl + '/' + getMarkerFilename(color, size)
            })
        }, zIndex);
    }


    function createMarkerStyle(color, size, zIndex) {
        return new ol.style.Style(createMarkerStyleDict(color, size, zIndex));
    }


    function createCircleStyleDict(color, size, zIndex) {
        return zIndexWrap({
            image: new ol.style.Circle({
                radius: size,
                fill: new ol.style.Fill({
                    color: getColor(color)
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffffff',
                    width: 1
                })
            })
        }, zIndex);
    }


    function createCircleStyle(color, size, zIndex) {
        return new ol.style.Style(createCircleStyleDict(color, size, zIndex));
    }


    //searches through a list of numbers and finds the one closest to the key
    //(going down in a reverse-sorted version)
    function getKeyClosestTo(keys, key) {
        keys = keys.sort(function (a, b) {
            return b - a;
        });
        var found = keys[0];
        var i;
        var l;
        for (i = 1, l = keys.length; i < l; i++) {
            if (keys[i] > key) {
                found = keys[i];
            } else {
                return found;
            }
        }
        return found;
    }

    //creates a resolution-dependant style,
    //should be called with a dict on the form
    // {
    //    res: {type: "", size: "", color: ""},
    //    res: {type: "", size: "", color: ""}
    //}
    function createResDependant(styleDict) {
        var styles = _.reduce(styleDict, function (acc, el, res) {
            var zIndex = _.has(el, 'zIndex')
                            ? el.zIndex
                            : null;
            if (el.type === 'marker') {
                acc[res]  = createMarkerStyle(el.color, el.size, zIndex);
            } else if (el.type === 'circle') {
                acc[res]  = createCircleStyle(el.color, el.size, zIndex);
            } else {
                throw new Error(
                    'Style type "' + el.type + '"" is not supported!'
                );
            }
            return acc;
        }, {});

        return function (feature, resolution) {
            //if the style is set directly on a feature (and not a layer)
            //it doesn't pass the feature, so param1 is resolution
            if (!(feature instanceof ol.Feature)) {
                resolution = feature;
            }

            var key = getKeyClosestTo(_.keys(styles), resolution);
            return [styles[key]];
        };
    }


    return {
        createMarkerStyle: createMarkerStyle,
        createMarkerStyleDict: createMarkerStyleDict,
        createResDependant: createResDependant,
        createCircleStyleDict: createCircleStyleDict,
        createCircleStyle: createCircleStyle
    };
};
