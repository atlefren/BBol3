/*global Backbone:false */

/*
    Base Backbone view that can be used to provided map-list interactions as in Havnebase.

    Assumes that the model passed has a feature property (which should be an ol3 vector feature)

    Assumes that the model triggers the following events:
        over: for mouseover on marker
        out: for mouseout on marker
        select: for marker click
        deselect: for deselect marker

    This view triggers the same events on the models based on DOM-events (can be overridden in events).

    To use this class, subclass it and override the following methods:

        render
        highlight
        unhighlight
        select  (be sure to call super though)
        deselect (be sure to call super though)

        See ol3demo.html for example use
*/

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
