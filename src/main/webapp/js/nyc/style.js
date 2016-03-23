window.nyc = window.nyc || {};

nyc.Style = (function(){	
	var styleClass = function(){};
	
	styleClass.prototype = {
		cache: {},
		pointerGeom: function(line, zoom){
			if (zoom < 2) return line;

			var start = line.getFirstCoordinate();
			var x0 = start[0];
			var y0 = start[1];
			
			var end = line.getLastCoordinate();
			var x1 = end[0];
			var y1 = end[1];
			
			var m = (y1 - y0) / (x1 - x0);
			var distance = line.getLength() / {'2': 2, '3': 4, '4': 8, '5': 16}[zoom];
		
			var x = x0 + ((x0 > x1 ? -1 : 1) * Math.sqrt((distance * distance) / (1 + (m * m))));
			var y = (m * (x - x0)) + y0;		
		
			return new ol.geom.LineString([start, [x, y]]);
		},
		textSym: function(name, geom, fontSize, align){
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
			return new ol.style.Style({
		    	geometry: labelPointer,
		    	stroke: new ol.style.Stroke({
					color: color,
					width: color == 'darkblue' ? 1 : 5
				})
			});
		},
		lineSym: function(geom, color){
			return new ol.style.Style({
		    	geometry: geom,
		    	stroke: new ol.style.Stroke({
					color: 'rgba(' + color + ',0.5)',
					width: 15
				}),
			});
		},
		pointSym: function(coord, color){
			return new ol.style.Style({
		    	geometry: new ol.geom.Point(coord),
		    	image: new ol.style.Circle({
		            radius: 7,
		    		fill: new ol.style.Fill({color: 'rgb(' + color + ')'}),
		            stroke: new ol.style.Stroke({color: 'darkblue', width: 1})
		          })
			});
		},
		zoom: function(resolution){
			var resolutions = nyc.ol.layer.BaseLayer.RESOLUTIONS, zoom = resolutions.indexOf(resolution);
			if (zoom == -1) {
				for (var z = 0; z < resolutions.length; z++){
					if (resolution > resolutions[z]){
						zoom = z;
						break;
					}
				}
			}
			return zoom;
		},
		style: function(feature, resolution){
			var zoom = this.zoom(resolution),
				name = feature.get('name'),
				geom = feature.get('geometry'),
				labelPointer = this.pointerGeom(feature.get('labelPointer'), zoom),
				labelPoint = new ol.geom.Point(labelPointer.getLastCoordinate()),
				status = feature.get('status'),
				conf = nyc.data.status[status] || {rgb: ''},
				color = conf.rgb.toString(),
				align = zoom > 5 ? feature.get('alignLine') : feature.get('alignPointer');
			
			this.cache[zoom] = this.cache[zoom] || {};
			this.cache[zoom][name] = this.cache[zoom][name] || {};
			if (this.cache[zoom][name][status]) {
				return this.cache[zoom][name][status];
			}
			
			this.cache[zoom][name][status] = {};
			
			if (zoom > 5){ /* render beach as labeled line geometry */
				this.cache[zoom][name][status] = [
			        this.lineSym(geom, color),
					this.textSym(name, geom, 16, align)
			    ];
			}else if (zoom > 3){ /* render beach as line geometry with label pointer */
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
					this.textSym(name, labelPoint, {'0': 11, '1': 12, '2': 14, '3': 16}[zoom], align)
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
