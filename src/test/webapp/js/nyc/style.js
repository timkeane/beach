var TEST_FEATURES = (function(){
	var csvData = [
		["LOCUST POINT YACHT CLUB","OPEN","BRONX","PRIVATE","41481445A"],
		["SCHUYLER HILL CIVIC ASSOCIATION","OPEN","BRONX","PRIVATE","40426416A"],
		["WHITESTONE BOOSTER CIVIC ASSOCIATION","OPEN","QUEENS","PRIVATE","41430136A"],
		["MANHATTAN BEACH","OPEN","BROOKLYN","PUBLIC","40426403A"]
	], result = [];
	$.each(csvData, function(_, csvRow){
		var mockApp = {
			feature: nyc.App.prototype.feature,
			normalize: nyc.App.prototype.normalize
		}
		result.push(mockApp.feature(csvRow));
	});
	return result;
}());

function assertHighRes(feature, styles, assert){
	var name = feature.get('name');
	var geom = feature.get('geometry');
	var style0 = styles[0];
	var style1 = styles[1];

	assert.equal(styles.length, 2, '');
	
	assert.deepEqual(style0.getGeometry(), geom);
	assert.equal(style0.getStroke().getWidth(), 15);
	assert.equal(style0.getStroke().getColor(), 'rgba(' + nyc.data.status[feature.get('status')].rgb.toString() + ',0.5)');
	
	assert.deepEqual(style1.getGeometry(), geom);
	assert.equal(style1.getText().getText(), name.capitalize());
	assert.equal(style1.getText().getFill().getColor(), 'darkblue');
	assert.equal(style1.getText().getStroke().getColor(), 'white');
	assert.equal(style1.getText().getStroke().getWidth(), 3);
	assert.equal(style1.getText().getTextAlign(), nyc.data.beaches[name].alignLine);
	assert.equal(style1.getText().getFont(), "16px 'Helvetica Neue', Helvetica, Arial, sans-serif");
};

function assertMedRes(feature, labelPointer, styles, assert){
	var name = feature.get('name');
	var geom = feature.get('geometry');
	var style0 = styles[0];
	var style1 = styles[1];
	var style2 = styles[2];
	var style3 = styles[3];

	assert.equal(styles.length, 4, '');
	
	assert.deepEqual(style0.getGeometry(), geom);
	assert.equal(style0.getStroke().getWidth(), 15);
	assert.equal(style0.getStroke().getColor(), 'rgba(' + nyc.data.status[feature.get('status')].rgb.toString() + ',0.5)');
	
	assert.deepEqual(style1.getGeometry().getCoordinates(), labelPointer.getCoordinates());
	assert.equal(style1.getStroke().getWidth(), 5);
	assert.equal(style1.getStroke().getColor(), 'white');
	
	assert.deepEqual(style2.getGeometry().getCoordinates(), labelPointer.getCoordinates());
	assert.equal(style2.getStroke().getWidth(), 1);
	assert.equal(style2.getStroke().getColor(), 'darkblue');
	
	assert.deepEqual(style3.getGeometry().getCoordinates(), labelPointer.getLastCoordinate());
	assert.equal(style3.getText().getText(), name.capitalize());
	assert.equal(style3.getText().getFill().getColor(), 'darkblue');
	assert.equal(style3.getText().getStroke().getColor(), 'white');
	assert.equal(style3.getText().getStroke().getWidth(), 3);
	assert.equal(style3.getText().getTextAlign(), nyc.data.beaches[name].alignPointer);
	assert.equal(style3.getText().getFont(), "16px 'Helvetica Neue', Helvetica, Arial, sans-serif");
};

function assertLowRes(feature, labelPointer, styles, fontSize, assert){
	var name = feature.get('name');
	var style0 = styles[0];
	var style1 = styles[1];
	var style2 = styles[2];
	var style3 = styles[3];

	assert.equal(styles.length, 4, '');
	
	assert.deepEqual(style0.getGeometry().getCoordinates(), labelPointer.getCoordinates());
	assert.equal(style0.getStroke().getWidth(), 5);
	assert.equal(style0.getStroke().getColor(), 'white');
	
	assert.deepEqual(style1.getGeometry().getCoordinates(), labelPointer.getCoordinates());
	assert.equal(style1.getStroke().getWidth(), 1);
	assert.equal(style1.getStroke().getColor(), 'darkblue');
	
	assert.deepEqual(style2.getGeometry().getCoordinates(), labelPointer.getFirstCoordinate());
	assert.equal(style2.getImage().getRadius(), 7);
	assert.equal(style2.getImage().getFill().getColor(), 'rgb(' + nyc.data.status[feature.get('status')].rgb.toString() + ')');
	assert.equal(style2.getImage().getStroke().getColor(), 'darkblue');
	assert.equal(style2.getImage().getStroke().getWidth(), 1);
	
	assert.deepEqual(style3.getGeometry().getCoordinates(), labelPointer.getLastCoordinate());
	assert.equal(style3.getText().getText(), name.capitalize());
	assert.equal(style3.getText().getFill().getColor(), 'darkblue');
	assert.equal(style3.getText().getStroke().getColor(), 'white');
	assert.equal(style3.getText().getStroke().getWidth(), 3);
	assert.equal(style3.getText().getTextAlign(), nyc.data.beaches[name].alignPointer);
	assert.equal(style3.getText().getFont(), fontSize + "px 'Helvetica Neue', Helvetica, Arial, sans-serif");
};

QUnit.test('nyc.Style.style', function(assert){
	var style = new nyc.Style();
	$.each(TEST_FEATURES, function(_, feature){
		$.each(nyc.ol.layer.BaseLayer.RESOLUTIONS, function(_, resolution){
			var styles = style.style(feature, resolution);
			var zoom = style.zoom(resolution);
			var name = feature.get('name');
			var status = feature.get('status');
			var labelPointer = style.pointerGeom(feature.get('labelPointer'), zoom);

			assert.deepEqual(styles, style.cache[zoom][name][status], '');
			if (zoom > 5){
				assertHighRes(feature, styles, assert);
			}else if (zoom > 3){
				assertMedRes(feature, labelPointer, styles, assert);
			}else{
				var fontSize = {'0': 11, '1': 12, '2': 14, '3': 16}[zoom];
				assertLowRes(feature, labelPointer, styles, fontSize, assert);
			}
		});
	});
	assert.equal();
});

