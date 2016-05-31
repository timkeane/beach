var timeOffset = 1000 * 60 * 15;
var cacheBust = Math.round(new Date().getTime() / timeOffset) * timeOffset;
		
$(document).ready(function(){
	
	function getName(name, type){
		var result = name;
		if (type == 'PUBLIC'){
			name = '<img src="img/park.png"> ' + name;
		}
		return name;
	};
	
	function listStatus(csvData){
		var tbody = $('#status-table tbody');
		$.each($.csv.toArrays(csvData), function(_, csvRow){
			var name = csvRow[0],
				type = csvRow[3],
				status = csvRow[1],
				boro = csvRow[2],
				conf = nyc.data.status[status.toLowerCase()] || {},
				tr = $('<tr class="capitalize"></tr>');
			tbody.append(tr);
			
			tr.append('<td class="name ' + type + '"><div class="notranslate" translate="no">' + getName(name, type) + '</div></td>')
			.append('<td><div class="notranslate" translate="no">' + boro + '</div></td>')
			.append('<td><div>' + type + '</div></td>')
			.append('<td class="status ' + conf.css + '"><div>' + status + '</div></td>');

		});
	};
	
	$.get('beach-status.csv?' + cacheBust, listStatus).fail(function(){
		alert("Unable to load beach status. Please try again.");
	});
});