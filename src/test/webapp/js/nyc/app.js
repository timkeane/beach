var TEST_APP = new nyc.App(
	new ol.Map({
		target: $('#map')[0],
		layers: [new nyc.ol.layer.BaseLayer()],
		view: new ol.View({
			projection: nyc.EPSG_2263,
			center: nyc.NYC_CENTER,
			resolutions: nyc.ol.layer.BaseLayer.RESOLUTIONS
		})
	}), 
	new nyc.Style()
);

QUnit.test('nyc.App.normalize', function(assert){
	assert.equal(TEST_APP.normalize(' ABCD  EFG HI/J  KlmN OPQRS XYZ '), 'abcd efg hi / j klmn opqrs xyz', '');
});

QUnit.test('nyc.App.feature', function(assert){
	nyc.data.beaches['sea gate beach club'].alignPointer = 'right';
	nyc.data.beaches['sea gate beach club'].alignLine = 'left';
	
	var csvRow = ['SEA GATE BEACH CLUB','OPEN','BROOKLYN','PRIVATE','40426409B'];
	var feature = TEST_APP.feature(csvRow);
	
	assert.equal(feature.get('name'), 'sea gate beach club', '');
	assert.equal(feature.get('status'), 'open', '');
	assert.equal(feature.get('boro'), 'brooklyn', '');
	assert.equal(feature.get('type'), 'private', '');
	assert.equal(feature.get('alignPointer'), 'right', '');
	assert.equal(feature.get('alignLine'), 'left', '');
	assert.deepEqual(feature.get('quality'), [], '');
	assert.deepEqual(feature.get('geometry').getCoordinates(), nyc.data.beaches['sea gate beach club'].lineString, '');
	assert.deepEqual(feature.get('labelPointer').getCoordinates(), nyc.data.beaches['sea gate beach club'].labelPointer, '');
	assert.deepEqual(feature.get('labelPoint').getCoordinates(), nyc.data.beaches['sea gate beach club'].labelPointer[1], '');
});

QUnit.test('nyc.App.beachQuality', function(assert){
	var csvData = '"SEA GATE BEACH CLUB","5/30/2015","1","2"\n' +
	   '"CEDAR GROVE","5/30/2015","3","4"\n' +
	   '"SEA GATE BEACH CLUB","6/7/2015","5","6"\n' +
	   '"CEDAR GROVE","6/7/2015","7","8"';

	var csvRow0 = ['SEA GATE BEACH CLUB','OPEN','BROOKLYN','PRIVATE','40426409B'];
	var csvRow1 = ['CEDAR GROVE','OPEN','STATEN ISLAND','PUBLIC','41595046A'];
	var feature0 = TEST_APP.feature(csvRow0);
	var feature1 = TEST_APP.feature(csvRow1);

	nyc.data.beaches['sea gate beach club'].feature = feature0;
	nyc.data.beaches['cedar grove'].feature = feature1;
	
	TEST_APP.beachQuality(csvData);
	assert.deepEqual(feature0.get('quality'), [['5/30/2015','1','2'],['6/7/2015','5','6']], '');
	assert.deepEqual(feature1.get('quality'), [['5/30/2015','3','4'],['6/7/2015','7','8']], '');
});
