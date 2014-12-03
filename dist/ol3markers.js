/*global ol: false */

var bbol3 = this.bbol3 || {};
bbol3.Markers = function (imgUrl) {
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
