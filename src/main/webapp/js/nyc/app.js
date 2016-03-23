window.nyc = window.nyc || {};

nyc.App = (function(){	
	/**
	 * nyc.App - a class to manage user interaction with beach data
	 * 
	 * @constructor
	 * @param {ol.Map} map
	 * @param {nyc.Style} style
	 * 
	 */
	var appClass = function(map, style){
		var me = this
		me.source = new ol.source.Vector({});
		map.addLayer(new ol.layer.Vector({source: me.source, style: $.proxy(style.style, style)}));
		me.map = map;
		me.style = style;
		$.get('beach-status.csv', $.proxy(me.beachFeatures, me)).fail(function(){
			me.alert("Unable to load beach status. Please try again.");
		});
		$('#status-table').filterable({filter: $.proxy(me.extent, me)});
	};
	
	appClass.prototype = {
		/** @private */
		map: null,
		/** 
		 * @private 
		 * @param {String} string
		 */
		normalize: function(string) {
			return string.toLowerCase().replace(/  /g, ' ').replace(/\//g, ' / ').trim();
		},
		/** 
		 * @private 
		 * @param {Array<String>} csvRow
		 */
		feature: function(csvRow){
			var	name = this.normalize(csvRow[0]);
			return new ol.Feature({
				geometry: new ol.geom.LineString(nyc.data.beaches[name].lineString),
				labelPointer: new ol.geom.LineString(nyc.data.beaches[name].labelPointer), 
				labelPoint: new ol.geom.Point(nyc.data.beaches[name].labelPointer[1]), 
				point: new ol.geom.Point(nyc.data.beaches[name].labelPointer[0]), 
				name: name,
				status: this.normalize(csvRow[1]),
				boro: this.normalize(csvRow[2]),
				type: this.normalize(csvRow[3]),
				alignPointer: nyc.data.beaches[name].alignPointer,
				alignLine: nyc.data.beaches[name].alignLine,
				quality: []
			});	
		},
		/** 
		 * Generates feature tips
		 *
		 * @private 
		 */
		createTip: function(){
			var tip = new nyc.ol.FeatureTip(this.map, [{source: this.source, labelFunction: this.style.tip}]);
			$('#status, #quality').hover(function(){tip.hide();});
		},
		/** 
		 * Parses beach status data into an array of ol.Feature objects and adds features to the map
		 * 
		 * @private 
		 * @param {String} csvData
		 */
		beachFeatures: function(csvData){
			var me = this, features = [];
			$.each($.csv.toArrays(csvData.trim()), function(_, csvRow){
				var	feature = me.feature(csvRow);
				nyc.data.beaches[feature.get('name')].feature = feature;
				features.push(feature);
				me.source.addFeature(feature);
			});
			me.status(features);
			me.createTip();
			me.getBeachQuality();
		},
		/**
		 * Retrieves water quality test data from the server
		 * 
		 * @private
		 */
		getBeachQuality: function(){
			$.get('beach-water-quality.csv', $.proxy(this.beachQuality, this)).fail(function(){
				me.alert("Unable to load water quality testing results. Please try again.");
			});
		},
		/**
		 * Maps water quality test results to beach names.
		 * 
		 * @private
		 * @param {String} csvData
		 */
		beachQuality: function(csvData){
			var me = this;
			$.each($.csv.toArrays(csvData.trim()), function(_, csvRow){
				nyc.data.beaches[me.normalize(csvRow.shift())].feature.get('quality').push(csvRow);
			});
		},
		/**
		 * Generates the display of all beaches and their current status
		 * 
		 * @private 
		 * @param {Array<ol.Feature>} features
		 */
		status: function(features){
			var me = this, tbody = $('#status-table tbody');
			features.sort(function(feature1, feature2){
				$.each([feature1, feature2], function(_, feature){
					feature.order = feature.get('type') == 'public' ? 0 : 1;
					feature.order += feature.get('boro');
					feature.order += feature.get('name');
					
				});
				if (feature1.order < feature2.order) return -1;
				if (feature1.order > feature2.order) return 1;
				return 0;
			});
			$.each(features, function(_, feature){
				var name = feature.get('name'),
					type = feature.get('type'),
					status = feature.get('status'),
					conf = nyc.data.status[status] || {},
					tr = $('<tr class="capitalize"></tr>');
				tbody.append(tr);
				tr.click(function(){me.quality(name);});
				tr.append('<td class="name ' + type + '"><div class="notranslate" translate="no">' + name + '</div></td>')
					.append('<td><div class="notranslate" translate="no">' + feature.get('boro') + '</div></td>')
					.append('<td><div>' + type + '</div></td>')
					.append('<td class="status ' + conf.css + '"><div>' + status + '</div></td>');
			});
			$('#status-table').table('refresh');
			$('#first-load').fadeOut();
		},
		/**
		 * Displays water quality testing results for the specified beach
		 * 
		 * @public 
		 * @param {String} name
		 */
		quality: function(name){
			var feature = nyc.data.beaches[name].feature, 
				status = feature.get('status'),
				conf = nyc.data.status[status] || {},
				quality = feature.get('quality'),
				tbody = $('#quality-table tbody');
			tbody.empty();
			$('#quality')[0].className = feature.get('type').toLowerCase();
			this.zoom(feature.get('geometry').getExtent());
			$('#quality .name').html(feature.get('name'));
			$('#quality-status')[0].className =  conf.css;
			$('#quality-status .status-name').html(status);
			$('#quality-status .status-msg').html(conf.msg || '');
			$.each(quality, function(_, qual){
				var tr = $('<tr></tr>');
				tbody.append(tr);
				tr.append('<td>' + qual[0] + '</td>')
					.append('<td>' + qual[1] + '</td>')
					.append('<td>' + qual[2] + '</td>');
			});
			if (window.history && window.history.pushState){
				window.history.pushState('forward', null, './#forward');
			}else{
				$('#quality button').attr('onclick', 'nyc.app.back();');
			}
			$('#quality-table').table('refresh');
			$('#status').fadeOut();
			$('#quality').fadeIn();
	        $('#main').animate({scrollTop: 0});
		},
		/**
		 * Returns the filter list of beach names
		 * 
		 * @private 
		 * @param {Array<Element>} nodes
		 * @return {Array<string>}
		 */
		names: function(nodes){
			var names = [];
			$.each(nodes, function(_, node){
				names.push($(node).html().toLowerCase());
			});
			return names;
		},
		/**
		 * Zooms the map to the extent of a list of named beaches
		 * 
		 * @private 
		 * @param {Array<string>} names
		 */
		extent: function(names){
			names = names && names.length ? names : this.names($('#status-table tr:not(.ui-screen-hidden) td.name div'));
			if (names.length > 0 && names.length < 11){
				var map = this.map, extent;
				$.each(names, function(_, name){
					extent = extent || ol.extent.boundingExtent(nyc.data.beaches[name].lineString);
					ol.extent.extend(extent, ol.extent.boundingExtent(nyc.data.beaches[name].lineString));
				});
				if ($(window).height() < 615){
					$('#main').animate({scrollTop: 0}, 1000);
				}
				this.zoom(extent);
			}
		},
		/**
		 * Determines if a clicked node is part of the translate menu
		 * 
		 * @private 
		 * @param {Element} node
		 * @return {boolean}
		 */
		isTranslate: function(node){
			if (!$('#lang-choice').data('init')){
				var me = this;
				$('#lang-choice').change(function(e){
					me.slide();
				});
				$('#lang-choice').data('init', 1);
			}
			return $(node).hasClass('menu-translate') || $(node).parent().hasClass('ui-first-child') || $('#lang-choice') === $(node);
		},
		/**
		 * Slide the menu items open or closed
		 * 
		 * @export
		 * @param {Element} node
		 */
		slide: function(node){
			var translate = this.isTranslate(node),
				item = translate ? $('#lang-btn') : $('#share-btns'),
				other = translate ? $('#share-btns') : $('#lang-btn');
			if (node && item.css('display') == 'none'){
				item.css({right: '-100px'});
				item.show();
				other.animate({right: '-100px'}, function(){
					other.hide();
				});
				item.animate({right: '126px'});
			}else{
				$('#share-btns, #lang-btn').animate({right: '-100px'}, function(){
					$('#menu').slideUp();
					$('#share-btns, #lang-btn').hide();
				});
			}
		},
		/**
		 * Slide the menu open or closed
		 * 
		 * @export
		 * @param {Element} node
		 */
		menu: function(node){
			if ($('#menu').css('display') != 'none'){
				this.slide(node);
			}else{
				$('#menu').slideDown();
			}
		},
		/**
		 * Zoom the map to the provided extent and zoom level
		 * 
		 * @private 
		 * @param {ol.Coordinate|ol.Extent} location
		 * @param {number=} zoom
		 */
		zoom: function(extent, zoom){
			var map = this.map, view = map.getView();
			map.beforeRender(
				ol.animation.pan({source: view.getCenter()}),
				ol.animation.zoom({resolution: view.getResolution()})
			);
			if (zoom){
				view.setCenter([(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2]);
				view.setZoom(zoom);
			}else{
				view.fit(extent, map.getSize());
			}
		},
		/**
		 * Navigates from water quality view back to the list of beach status
		 * 
		 * @private 
		 */
		back: function(){
			var top = $(window).height() < 620 ? $('#quality').position().top - 48 : 0;
			$('#quality').fadeOut();
			$('#status').fadeIn();
			$('#main').animate({scrollTop: top}, 1000);				
		},
		/**
		 * Displays error message
		 * 
		 * @private 
		 */
		alert: function(msg){
			$('body').append($('#alert'));
			$('#first-load').fadeOut();
			$('#alert').html(msg).fadeIn();
		}
	};
	
	return appClass;
}());
