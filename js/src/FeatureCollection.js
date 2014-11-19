/*global Backbone: false, ol: false*/

var BW = this.BW || {};
(function (ns) {
    'use strict';

     //modell for havn
    ns.FeatureModel = Backbone.Model.extend({
        initialize: function (data) {

            //la feature kunne trigge backbone-events
            _.extend(data.feature, Backbone.Events);

            //lytt på events fra feature
            this.get('feature').on('over', this.featureOver, this);
            this.get('feature').on('out', this.featureOut, this);
            this.get('feature').on('select', this.featureSelect, this);
            this.get('feature').on('deselect', this.featureDeselect, this);

            //Lytt på events fra seg selv
            this.on('over', this.highlightFeature, this);
            this.on('out', this.unhighlightFeature, this);
            this.on('select', this.selectFeature, this);
            this.on('deselect', this.deselectFeature, this);
        },

        featureOver: function () {
            this.trigger('over');
        },

        featureOut: function () {
            this.trigger('out');
        },

        featureSelect: function (feature) {
            this.trigger('select', feature);
        },

        featureDeselect: function (feature) {
            this.trigger('deselect', feature);
        },

        selectFeature: function () {
            this.get('feature').setStyle(
                this.collection.options.selectStyle
            );
            this.get('feature').select = true;
        },

        deselectFeature: function () {
            this.get('feature').setStyle(
                this.collection.options.featureStyle
            );
        },

        highlightFeature: function () {
            this.get('feature').setStyle(
                this.collection.options.selectStyle
            );
        },

        unhighlightFeature: function () {
            if (!this.get('feature').select) {
                this.get('feature').setStyle(
                    this.collection.options.featureStyle
                );
            }
        }

    });

    ns.FeatureCollection = Backbone.Collection.extend({

        model: ns.FeatureModel,

        initialize: function (data, options) {
            this.options = options;
            this.on('select', this.featureSelected, this);
        },

        featureSelected: function (selectedFeature) {
            this.each(function (model) {
                if (model.get('feature') !== selectedFeature) {
                    model.trigger('deselect', model.get('feature'));
                }
            });
        },

        getLayer: function () {
            if (!this.layer) {
                this.vectorSource = new ol.source.Vector();
                this.layer =  new ol.layer.Vector({
                    source: this.vectorSource,
                    style: this.options.featureStyle
                });
                //legg features til layer
                this.each(function (harbour) {
                    this.vectorSource.addFeature(harbour.get('feature'));
                }, this);
            }
            return this.layer;
        }
    });

}(BW));
