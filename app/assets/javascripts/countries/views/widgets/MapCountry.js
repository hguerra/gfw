define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'topojson',
  'helpers/geojsonUtilsHelper',
  'map/views/maptypes/grayscaleMaptype',
  'core/View',
  'mps',
  'text!countries/templates/widgets/legendMap.handlebars'
], function(
  $,
  Backbone,
  _,
  Handlebars,
  topojson,
  geojsonUtilsHelper,
  grayscaleMaptype,
  View,
  mps,
  tpl) {

  'use strict';

  var MapCountry = View.extend({

    el: '#map',
    template: Handlebars.compile(tpl),

    events: {
      'click .js-toggle-layer' : 'toogleLayer',
    },

    /**
     * Google Map Options.
     */
    default: {
      minZoom: 1,
      backgroundColor: '#99b3cc',
      disableDefaultUI: true,
      panControl: false,
      zoomControl: true,
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

    _subscriptions:[
      {
        'Regions/update': function(value) {

        }
      },
    ],

    initialize: function(params, options) {
      View.prototype.initialize.apply(this);
      this.paramsMap = _.extend({}, this.default, params);
      this.render();
    },

    render: function() {
      this.map = new google.maps.Map(this.el, this.paramsMap);
      this.map.mapTypes.set('grayscale', grayscaleMaptype());
      this.setGeom();
      this.$el.append(this.template());
    },

    setGeom: function() {
      if(this.paramsMap.region) {
        var geometry = JSON.parse(this.paramsMap.countryData.geojson);
        bounds = geojsonUtilsHelper.getBoundsFromGeojson(geometry);
        this.drawGeojson(geometry);
        this.map.fitBounds(bounds)

      } else {
        var resTopojson = JSON.parse(this.paramsMap.countryData.topojson);
        var objects = _.findWhere(resTopojson.objects, {
          type: 'MultiPolygon'
        });
        var topoJson = topojson.feature(resTopojson,objects),
            geojson = topoJson.geometry,
            bounds = geojsonUtilsHelper.getBoundsFromGeojson(geojson);

        this.drawGeojson(geojson);
        this.map.fitBounds(bounds)
      }
    },

    toogleLayer: function(e){
      _.each(this.$el.find('.onoffswitch'), function(toggle) {
        var $toggle = $(toggle);
        var optionSelected = $toggle.hasClass('checked');
        if (optionSelected) {
          $toggle.removeClass('checked');
        }
      });
      $(e.target).addClass('checked');
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
