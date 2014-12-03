BBol3
=====
A lightweight integration between OpenLayers3 and Backbone.js Based on the library "bwmaplib" from Barentswatch (https://github.com/barentswatch/maplib).


Components
----------
A run-down of the various components, these are built into separate files, as few of them have any hard dependencies on each other.


#### bbol3.ConfigParser
A class for setting up an OpenLayers3 map based on a JSON-structured config file. The structure of this file is described later.


#####Usage
     
     //create a new ConfigParser
     var cp = new bbol3.ConfigParser();

The configParser exposes four methods:

     cp.setupMap(mapConfig, mapEl, callback);

setupMap sets up a map, based on the mapConfig, in the specified element and then calls your callback-function.
- mapConfig can either be a JSON-string, a POJO or an url to a JSON-file
- mapEl can either be a DOM id in form of a strin (i.e. "map"), or a DOM element
- the callbacks must excpect to recieve two arguments:
    - olMap: the ol3 map object
    - layers: a dict with two keys: 
        - baseLayers: the base layers (Array)
        - overlays: the overlays (Array)
    - the induvidual layers in the arrays are dicts with the attributes from the config and a ollayer attribute, which is the OpenLayers layer object.



     cp.hideLayer(layerDict);

This hides a layer, expects a dict in the same form as those returned by initMap. Should only be used for overlays

    cp.addOverlay(layerDict);

This adds an overlay layer to the map.

    cp.setBaseLayer(layerDict);

This sets a new baseLayer on the map.    


##### MapConfig
The config defines the properties on the map. A lot of properties have defaults, and several of the layer-properties can be inherited from the map. The overall structure looks like this
    
    {
        "numZoomLevels": int, //default 18
        "maxResolution2": number, //default 21664.0
        "extent": ol.Extent, //default [-2500000.0, 3500000.0, 3045984.0, 9045984.0]
        "center": ol.Coordinate, //initial center, default [-20617, 7661666]
        "zoom": int //initial zoom, default 2
        "srid": string, //epsg-code, default 'EPSG:32633'
        "extentUnits": string, //default 'm'
        "renderer": ol.RendererType //default 'canvas'
        "layers": [] // a list of layer dicts (see below)
    }
    
The layers have some common attributes, and some that depends on their source.
    
The common ones are:
    
        {
            "isBaseLayer": bool, // can be omitted, defaults to false
            "visible": bool, // can beomitted, defaults to true
            "source": string, the type of layer ("WMS", "WMTS" or "GeoJSON")
            "name": string
        }
A note on baseLayers and "visible": The first baseLayer with visible=true is default shown, if no baseLayers has visible=true the first baseLayers is shown.

For WMS layers the folowing attributes are defined:

    {
        "url": string, //the url to the wms server
        "layername": string //name of the layer on the server,
        "transparent": bool, //should layer be transparent (default false for baseLayer, true for overlay)
        "tiled": bool, //should this be a tiled wms (WMS-C), default true,
        "version": string, //wms version, default 1.1.1
        "format": string, //image format, default image/png
        "options": dict, //extra properties to set on the WMS request
    }

For WMTS layers the folowing attributes are defined:

    {
        "url": string, //the url to the wmts server
        "layername": string //name of the layer on the server
        "format": string, //image format, default image/png 
        "srid": string, //epsg-code, default same as map
        "extentUnits": string, //default same as map
        "extentUnits": string //default same as map
    }    

For GeoJSON layers the following attributes are defined:
    
    {
        "data": object, //a GeoJSON featurecollection
        "url": string //url to a GeoJSON featureCollection
    }
Set one of these    

    
#### bbol3.initBBMap
A function that wraps the returned layers in Backbone collections. See examples/layerlist.html


#### bbol3.FeatureModel & bbol3.FeatureCollection
Provides functionality for mapping an openlayers vector layer and features to
Backbone models and views.

##### Usage:

Create a new bbol3.FeatureModel (or a subclass) by passing it data that has a
"geometry" field as a geoJSON geometry. ie:

    new bbol3.FeatureCollection([{
        "name": "myname",
        "geometry": {"type":"Point","coordinates":[10.0, 10.0]}
    }])

The geometry field will be converted to a "feature"-attribute on the model,
this is in fact an ol vector feature, and the geometry attribute will be unset.
The created feature will also be extended to be able to pass Backbone-style events.

The FeatureCollection also handles selects and hover events, and should be
given two openlayers style obects in the options-dict:
    
        new bbol3.FeatureCollection(
            featureList,
        {
            featureStyle: styleForNormal,
            selectStyle: styleForSelected
        }
    );

Expects the feature attribute to trigger the following events:
- over
- out
- select
- deselect

These events changes the feature style and further triggers these events on
the model, so that views can act accordingly.

The FeatureCollection also provides a getLayer()-method, that returns an
ol vector layer with a feature for all it's models.


See examples/ol3demo.html for usage.

Under development

#### bbol3.ListMapView,
Base Backbone view that can be used to provided map-list interactions as in Havnebase.

Assumes that the model bassed has a feature property (which should be an ol3 vector feature)

Assumes that the model triggers the following events:
- over: for mouseover on marker
- out: for mouseout on marker
- select: for marker click
- deselect: for deselect marker

This view triggers the same events on the models based on DOM-events (can be overridden in events).

To use this class, subclass it and override the following methods:

- render
- highlight
- unhighlight
- select  (be sure to call super though)
- deselect (be sure to call super though)

See ol3demo.html for example use


#### BBol3.Markers
Sets up a marker style (based on provided markers) with an optional zIndex.

Usage:

    var markerCreator = new bbol3.Markers('/path/to/markers/folder');
    var myMarker = markerCreator.createMarkerStyle('red', 'md'); //creates a medium red marker
    var myMarker = markerCreator.createMarkerStyle('green', 'sm', 1000); //creates a large green marker with z-index 1000

Use the createMarkerStyleDict in the same fasihon to get a POJO (ie not wrapped i ol.styleStyle).
This is useful for creating more complicated rules and such.


Running tests
-------------
0. Make sure nodejs is installed
1. npm install
2. grunt test



    

    
