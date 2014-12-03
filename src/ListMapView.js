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
