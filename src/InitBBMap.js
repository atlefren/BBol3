/*global Backbone:false */
var bbol3 = this.bbol3 || {};
(function (ns) {

    function listenToOverlayEvents(layerCollection, cp) {
        layerCollection.on('change:visible', function (model) {
            if (model.get('visible')) {
                cp.addOverlay(model.attributes);
            } else {
                cp.hideLayer(model.attributes);
            }
        });
    }

    function listenToBaseLayerEvents(layerCollection, cp) {
        layerCollection.on('change:visible', function (changedModel) {
            if (!changedModel.get('visible')) {
                return;
            }
            cp.setBaseLayer(changedModel.attributes);
            layerCollection.each(function (model) {
                if (model !== changedModel) {
                    model.set({'visible': false});
                }
            });
        });
    }

    ns.initBBMap = function (mapConfig, mapEl, callback) {
        var cp = new ns.ConfigParser();
        var baseLayers = new Backbone.Collection();
        listenToBaseLayerEvents(baseLayers, cp);
        var overlays = new Backbone.Collection();
        listenToOverlayEvents(overlays, cp);
        function mapSetup(olmap, layers) {
            baseLayers.reset(layers.baseLayers);
            overlays.reset(layers.overlays);
            callback(baseLayers, overlays, olmap);
        }
        cp.setupMap(mapConfig, mapEl, mapSetup);
    };
}(bbol3));
