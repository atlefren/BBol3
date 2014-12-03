/*global ol: false */
/*
    Sets up a marker style (based on provided markers) with an optional zIndex.

    Usage:
    var markerCreator = new BW.MapCore.Markers('/path/to/markers/folder');
    var myMarker = markerCreator.createMarkerStyle('red', 'md'); //creates a medium red marker
    var myMarker = markerCreator.createMarkerStyle('green', 'sm', 1000); //creates a large green marker with z-index 1000

    Use the createMarkerStyleDict in the same fasihin to get a POJO (ie not wrapped i ol.styleStyle).
    This is useful for creating more complicated rules and such.
*/

var BW = this.BW || {};
BW.MapCore = BW.MapCore || {};
BW.MapCore.Markers = function (imgUrl) {
    'use strict';

    function createMarkerStyleDict(color, size, zIndex) {
        var dict = {
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: imgUrl + '/pin-' + size + '-' + color + '.png'
            })
        };
        if (zIndex) {
            dict.zIndex = zIndex;
        }
        return dict;
    }

    function createMarkerStyle(color, size, zIndex) {
        return new ol.style.Style(createMarkerStyleDict(color, size, zIndex));
    }


    return {
        createMarkerStyle: createMarkerStyle,
        createMarkerStyleDict: createMarkerStyleDict
    };
};
