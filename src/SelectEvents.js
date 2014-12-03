/*global ol:false */
/*
    bbol3.registerHoverEvents registers hover/click events on a given vector layer on a given map.
    The events are triggered as Backbone events, so it's assumed that prevoius code has done
    _.extend(feature, Backbone.events);

    This code does not change style or anything else, just triggers the "on" and "off" events.

    See ol3demo.html for example use.
*/

var bbol3 = this.bbol3 || {};
bbol3.SelectEvents = bbol3.SelectEvents || {};
(function (ns) {
    'use strict';

    function registerSelectEventsHack(condition, map, layer, on, off) {
        $(map.getViewport()).on(condition, function (evt) {
            var pixel = map.getEventPixel(evt.originalEvent);

            var features = layer.getSource().getFeatures();
            var selected  = _.find(features, function (feature) {
                return (feature[on] === true);
            });

            var feature = map.forEachFeatureAtPixel(pixel, function (feature, fLayer) {
                if (fLayer === layer) {
                    return feature;
                }
            });
            if (selected) {
                map.getTarget().style.cursor = '';
                selected[on] = false;
                selected.trigger(off, selected);
            }

            if (feature && feature !== selected) {
                map.getTarget().style.cursor = 'pointer';
                feature[on] = true;
                feature.trigger(on, feature);
            }
        });
    }

    function registerSelectEvents(map, layer, style, condition, on, off) {
        var interaction = new ol.interaction.Select({
            condition: condition,
            layers: [layer],
            style: style
        });
        map.addInteraction(interaction);
        var features = interaction.getFeatures();
        var selectedHere = null;

        features.on('change:length', function () {
            if (features.getLength() > 0) {
                var sel = features.getArray()[0];
                if (sel !== selectedHere) {
                    selectedHere = sel;
                    selectedHere.trigger(on, selectedHere);
                }
            } else {
                layer.getSource().forEachFeature(function (e) {
                    e.trigger(off, e);
                });
                selectedHere = null;
            }
        });

        layer.on(off + 'Feature', function () {
            layer.getSource().forEachFeature(function (e) {
                if (!e[on]) {
                    features.remove(e);
                }
            });
        });

        layer.on(on + 'Feature', function () {
            layer.getSource().forEachFeature(function (e) {
                if (e[on] && e !== selectedHere) {
                    features.push(e);
                }
            });
        });
    }

    ns.registerHoverEvents = function (map, layer, hightlightStyle) {
        registerSelectEventsHack('mousemove', map, layer, 'over', 'out');

        /*
        TODO when https://github.com/openlayers/ol3/pull/2965 gets merged
        to ol3 master and released we should rewrite this to work in the same
        fashion as registerClickEvents (using a ol.events.condition.mouseMove
        condition with a Select interaction. Then we can drop all style-
        related stuff in FeatureCollection.js
        this can be done by removing the call to registerSelectEventsHack
        and enable the lines below
        */
        /*
        var on = 'over';
        var off = 'out';
        var condition = ol.events.condition.mouseMove;
        registerSelectEvents(map, layer, hightlightStyle, condition, on, off);
        */

        /*
        In addition, the bbol3.FeatureModel (in FeatureCollection.js) needs to be
        changed, replace the highlightFeature and unhighlightFeature with these:

        highlightFeature: function () {
            this.get('feature').over = true;
            this.collection.getLayer().dispatchEvent('overFeature');
        },

        unhighlightFeature: function () {
            this.get('feature').over = false;
            this.collection.getLayer().dispatchEvent('outFeature');
        }

        Also make sure to pass a hightlight-style to registerHoverEvents
        */
    };


    ns.registerClickEvents = function (map, layer, selectStyle) {
        var on = 'select';
        var off = 'deselect';
        var condition = ol.events.condition.click;
        registerSelectEvents(map, layer, selectStyle, condition, on, off);
    };

}(bbol3.SelectEvents));
