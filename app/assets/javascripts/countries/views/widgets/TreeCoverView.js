define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'uri',
  'services/CountryService',
  'common/views/PieGraphView',
  'text!countries/templates/widgets/treeCover.handlebars'
], function(
  $,
  Backbone,
  _,
  Handlebars,
  UriTemplate,
  CountryService,
  PieGraphView,
  tpl) {

  'use strict';

  var API = window.gfw.config.GFW_API_HOST_PROD;
  var DATASET_COVER = '0ef4a861-930f-4f56-865d-89f5c0c6aef0';
  var QUERY_TOTAL_COVER = '/query?sql=select sum(area) as value FROM {dataset} WHERE iso=\'{iso}\' and thresh=30 group by iso';
  var DATASET_IFL = 'de9ab235-452c-4832-97ab-1b55287beb4e';
  var QUERY_TOTAL_IFL = '/query?sql=select sum(area) as value FROM {dataset} WHERE iso=\'{iso}\' and thresh=30 group by iso';

  var TreeCoverView = Backbone.View.extend({
    el: '#widget-tree-cover',

    template: Handlebars.compile(tpl),

    initialize: function(params) {
      this.iso = params.iso;

      this._getData().done(function(data) {
        this.data = data;
        this._initWidget();
      }.bind(this));
    },

    _initWidget: function() {
      this.render();

      this.pieGraph = new PieGraphView({
        el: '#tree-cover-graph',
        data: [
          {
            category: 1,
            value: this.data.totalCover,
            color: '#97be32'
          },
          {
            category: 2,
            value: this.data.totalIfl,
            color: '#168500'
          },
          {
            category: 3,
            value: this.data.rest,
            color: '#dddde0'
          }
        ]
      });
    },

    _getData: function() {
      var $promise = $.Deferred();
      var data = {};

      var urlTotalCover = API + new UriTemplate(QUERY_TOTAL_COVER).fillFromObject({
        dataset: DATASET_COVER, iso: this.iso
      });

      var urlTotalIfl = API + new UriTemplate(QUERY_TOTAL_IFL).fillFromObject({
        dataset: DATASET_IFL, iso: this.iso
      });

      CountryService.getCountriesInfo({
        columns: 'area_ha',
        filter: 'WHERE iso=\''+ this.iso +'\''
      })
      .then(function(results) {
        this.totalArea = Math.round(results[0].area_ha);

        $.ajax({ url: urlTotalCover, type: 'GET'})
          .done(function(totalCover) {
            var totalCoverValue = Math.round(totalCover.data[0].value);
            data['total'] = Math.round(totalCover.data[0].value / 1000000);
            data['totalCover'] = totalCoverValue;

            $.ajax({ url: urlTotalIfl, type: 'GET'})
              .done(function(totalIfl) {
                var totalIflValue = Math.round(totalIfl.data[0].value);
                data['totalIfl'] = totalIflValue;
                data['rest'] = this.totalArea - (data['totalCover'] + data['totalIfl']);

                $promise.resolve(data)
              }.bind(this))
              .fail(function(err){
                $promise.reject(err);
              });
          }.bind(this))
          .fail(function(err){
            $promise.reject(err);
          });
      }.bind(this))

      .error(function(error) {
        console.warn(error);
      }.bind(this))

      return $promise;
    },

    render: function() {
      this.$el.html(this.template({
        totalCover: this.data.total
      }));
      this.$el.removeClass('-loading');
    }
  });
  return TreeCoverView;

});
