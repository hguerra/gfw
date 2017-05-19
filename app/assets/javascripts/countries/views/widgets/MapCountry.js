define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'topojson',
  'helpers/geojsonUtilsHelper',
  'map/views/maptypes/grayscaleMaptype',
  'mps'
], function(
  $,
  Backbone,
  _,
  Handlebars,
  topojson,
  geojsonUtilsHelper,
  grayscaleMaptype,
  mps) {

  'use strict';

  var MapCountry = Backbone.View.extend({

    el: '#map',

    /**
     * Google Map Options.
     */
    default: {
      minZoom: 1,
      backgroundColor: '#99b3cc',
      disableDefaultUI: true,
      panControl: false,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      overviewMapControl: false,
      tilt: 0,
      center: {lat: -34.397, lng: 150.644},
      scrollwheel: false,
      zoom: 4,
      mapTypeId: 'grayscale'
    },

    initialize: function(params, options) {
      this.paramsMap = _.extend({}, this.default, params);
      this.render();
    },

    render: function() {
      this.map = new google.maps.Map(this.el, this.paramsMap);
      this.map.mapTypes.set('grayscale', grayscaleMaptype());
      this.setGeom();
    },

    setGeom: function() {
      var resTopojson = JSON.parse(this.paramsMap.countryData.topojson);
      var objects = _.findWhere(resTopojson.objects, {
        type: 'MultiPolygon'
      });
      var topoJson = topojson.feature(resTopojson,objects),
          geojson = topoJson.geometry,
          bounds = geojsonUtilsHelper.getBoundsFromGeojson(geojson);

      this.drawGeojson(geojson);
      this.map.fitBounds(bounds)
    },

    drawGeojson: function(geojson) {
      var geojson = geojson;
      var paths = geojsonUtilsHelper.geojsonToPath(geojson);
      var overlay = new google.maps.Polygon({
        paths: paths,
        editable: false,
        strokeWeight: 2,
        fillOpacity: 0,
        fillColor: '#FFF',
        strokeColor: '#A2BC28'
      });

      overlay.setMap(this.map);
    }

  });
  return MapCountry;
});
