window.nyc = window.nyc || {};

nyc.Style = (function(){	
	var styleClass = function(){};
	
	styleClass.prototype = {
		cache: {},
		pointerGeom: function(line, zoom){
			if (zoom < 11){
				return line;
			}

			var start = line.getFirstCoordinate();
			var x0 = start[0];
			var y0 = start[1];
			
			var end = line.getLastCoordinate();
			var x1 = end[0];
			var y1 = end[1];
			
			var m = (y1 - y0) / (x1 - x0);
			var distance = line.getLength() / {'11': 2, '12': 4, '13': 8, '14': 16}[zoom];
		
			var x = x0 + ((x0 > x1 ? -1 : 1) * Math.sqrt((distance * distance) / (1 + (m * m))));
			var y = (m * (x - x0)) + y0;		
		
			return new ol.geom.LineString([start, [x, y]]);
		},
		textSym: function(name, geom, fontSize, align){
			
			console.info('textSym',arguments);
			return new ol.style.Style({
		    	geometry: geom,
				text: new ol.style.Text({
					text: name.capitalize(),
					textAlign: align,
					font: fontSize + 'px \'Helvetica Neue\', Helvetica, Arial, sans-serif',
					fill: new ol.style.Fill({color: 'darkblue'}),
					stroke: new ol.style.Stroke({color: 'white', width: 3})
				})
			});
		},
		pointerSym: function(labelPointer, color){
			//console.info('pointerSym',arguments);
			return new ol.style.Style({
		    	geometry: labelPointer,
		    	stroke: new ol.style.Stroke({
					color: color,
					width: color == 'darkblue' ? 1 : 5
				})
			});
		},
		lineSym: function(geom, color){
			//console.info('lineSym',arguments);
			return new ol.style.Style({
		    	geometry: geom,
		    	stroke: new ol.style.Stroke({
					color: 'rgba(' + color + ',0.5)',
					width: 15
				}),
			});
		},
		pointSym: function(coord, color){
			//console.info('pointSym',arguments);
			return new ol.style.Style({
		    	geometry: new ol.geom.Point(coord),
		    	image: new ol.style.Circle({
		            radius: 7,
		    		fill: new ol.style.Fill({color: 'rgb(' + color + ')'}),
		            stroke: new ol.style.Stroke({color: 'darkblue', width: 1})
		          })
			});
		},
		style: function(feature, resolution){
			var zoom = nyc.ol.TILE_GRID.getZForResolution(resolution),
				name = feature.get('name'),
				geom = feature.get('geometry'),
				labelPointer = this.pointerGeom(feature.get('labelPointer'), zoom),
				labelPoint = new ol.geom.Point(labelPointer.getLastCoordinate()),
				status = feature.get('status'),
				conf = nyc.data.status[status] || {rgb: ''},
				color = conf.rgb.toString(),
				align = zoom > 14 ? feature.get('alignLine') : feature.get('alignPointer');
			
			this.cache[zoom] = this.cache[zoom] || {};
			this.cache[zoom][name] = this.cache[zoom][name] || {};
			if (this.cache[zoom][name][status]) {
				return this.cache[zoom][name][status];
			}
			
			this.cache[zoom][name][status] = {};
			
			if (zoom > 14){ /* render beach as labeled line geometry */
				this.cache[zoom][name][status] = [
			        this.lineSym(geom, color),
					this.textSym(name, geom, 16, align)
			    ];
			}else if (zoom > 12){ /* render beach as line geometry with label pointer */
				this.cache[zoom][name][status] = [
		            this.lineSym(geom, color),
		 			this.pointerSym(labelPointer, 'white'),
		 			this.pointerSym(labelPointer, 'darkblue'),
					this.textSym(name, labelPoint, 16, align)
		       ];
			}else{ /* render beach as point geometry with label pointer */
				this.cache[zoom][name][status] = [
		 			this.pointerSym(labelPointer, 'white'),
		 			this.pointerSym(labelPointer, 'darkblue'),
		 	        this.pointSym(labelPointer.getFirstCoordinate(), color),
					this.textSym(name, labelPoint, {'9': 11, '10': 12, '11': 14, '12': 16}[zoom], align)
			    ];
			}
			return this.cache[zoom][name][status];
		},
		tip: function(){
			var status = this.get('status');
			if (status){
				var conf = nyc.data.status[status] || {};
				return {
					cssClass: conf.css,
					text: '<div class="name ' + this.get('type').toLowerCase() + '">' + this.get('name') + '<div class="icon"></div></div>' +
					'<div class="status-name">' + status + '</div>' +
					(conf.msg ? ('<div class="status-msg">' + conf.msg + '</div>') : '')
				};
			}
		}
	};

	return styleClass;
}());

String.prototype.capitalize = String.prototype.capitalize ||
function(){
	var words = this.split(' '), result = '';
	$.each(words, function(_, word){
		result += (word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase() + ' ');
	});
	return result.trim();
};
