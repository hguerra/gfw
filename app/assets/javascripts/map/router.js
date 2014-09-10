/**
 * The router module.
 *
 * Router handles app routing and URL parameters and updates Presenter.
 *
 * @return singleton instance of Router class (extends Backbone.Router).
 */
define([
  'underscore',
  'backbone',
  'amplify',
  'map/utils',
  'map/services/PlaceService'
], function(_, Backbone, amplify, utils, PlaceService) {

  'use strict';

  var Router = Backbone.Router.extend({

    routes: {
      'map(/:zoom)(/:lat)(/:lng)(/:iso)(/:maptype)(/:baselayers)(/:sublayers)(/)': 'map',
      'embed/map(/:zoom)(/:lat)(/:lng)(/:iso)(/:maptype)(/:baselayers)(/:sublayers)(/)': 'embed'
    },

    /**
     * Boot file:
     *
     * @param  {[type]} boot [description]
     */
    initialize: function(mainView) {
      this.bind('all', this._checkForCacheBust());
      this.name = null;
      this.mainView = mainView;
      this.placeService = new PlaceService(this);
    },

    map: function() {
      this.name = 'map';
      this.mainView.setMapMode();
      this.initMap.apply(this, arguments);
    },

    embed: function() {
      this.name = 'embed/map';
      this.initMap.apply(this, arguments);
    },

    initMap: function(zoom, lat, lng, iso, maptype, baselayers, sublayers) {
      var params = _.extend({
        zoom: zoom,
        lat: lat,
        lng: lng,
        iso: iso,
        maptype: maptype,
        baselayers: baselayers,
        sublayers: sublayers
      }, _.parseUrl());

      this.placeService.initPlace(this.name, params);
    },

    /**
     * If the URL contains the cache parameter (e.g., cache=bust), clear all
     * cached values in the browser (e.g., from memory, local storage,
     * session).
     */
    _checkForCacheBust: function() {
      var params = _.parseUrl();

      if (_.has(params, 'cache')) {
        _.each(amplify.store(), function(value, key) {
          amplify.store(key, null);
        });
      }
    },

    navigateTo: function(route, options) {
      this.navigate(route, options);
    }

  });

  return Router;

});