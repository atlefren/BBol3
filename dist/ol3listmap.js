/*global Backbone: false, ol: false*/

var bbol3 = this.bbol3 || {};
(function (ns) {
    'use strict';

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
            this.get('feature').select = false;
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

        reset: function (models, options) {
            var format = new ol.format.GeoJSON();
            var modifiedModels = models.map(function (model) {
                if (model instanceof Backbone.Model) {
                    model.set('feature', new ol.Feature({
                        geometry: format.readGeometry(model.get('geometry'))
                    }));
                    model.unset('geometry', {silent: true});
                } else {
                    model.feature =  new ol.Feature({
                        geometry: format.readGeometry(model.geometry)
                    });
                    delete model.geometry;
                }
                return model;
            });

            var d = Backbone.Collection.prototype.reset.apply(
                this,
                [modifiedModels, options]
            );
            return d;
        },

        initialize: function (data, options) {
            this.options = options;
            this.on('select', this.featureSelected, this);
            this.on('reset', this.parseFeatures, this);
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

}(bbol3));

/*global Backbone:false */

var bbol3 = this.bbol3 || {};
(function (ns) {
    'use strict';

    ns.ListMapView = Backbone.View.extend({

        //lytt på dom-elementet
        events: {
            'mouseover': 'mouseover',
            'mouseout': 'mouseout',
            'click': 'click'
        },

        initialize: function () {

            //lytt på modellen
            this.model.on('over', this.highlight, this);
            this.model.on('out', this.unhighlight, this);
            this.model.on('select', this.select, this);
            this.model.on('deselect', this.deselect, this);

            this.selected = false;
        },

        render: function () {
            return this;
        },

        click: function () {
            if (this.selected) {
                this.model.trigger('deselect', this.model.get('feature'));
            } else {
                this.model.trigger('select', this.model.get('feature'));
            }
        },

        mouseover: function () {
            this.model.trigger('over');
        },

        mouseout: function () {
            this.model.trigger('out');
        },

        highlight: function () {
            return this;
        },

        unhighlight: function () {
            return this;
        },

        select: function () {
            this.selected = true;
        },

        deselect: function () {
            this.selected = false;
        }
    });

}(bbol3));
