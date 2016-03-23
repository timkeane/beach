$(document).ready(function(){
	
	new nyc.Lang('body', nyc.data.languages);
	new nyc.Share('body');
	
	var base = new nyc.ol.layer.BaseLayer();
	var ortho = new nyc.ol.layer.BaseLayer(nyc.ol.layer.BaseLayer.ORTHO_OPTIONS);
	
	var timeout = false;
	base.on('postcompose', function(event){
		nyc.ol.layer.grayscale(event);
		if (!timeout)
			setTimeout(function(){
				$('#first-load').fadeOut();
			}, 1000);
		timeout = true;
	});

	var map = new ol.Map({
		target: $('#map')[0],
		layers: [base, ortho],
		view: new ol.View({
			projection: nyc.EPSG_2263,
			center: nyc.NYC_CENTER,
			resolutions: nyc.ol.layer.BaseLayer.RESOLUTIONS
		})
	});
	/* show water quality data on feature click */
	map.on('singleclick', function(evt){
		map.forEachFeatureAtPixel(evt.pixel, function(feature){
			nyc.app.quality(feature.get('name'));
		});
	});
	/* hide map on page load if small screen */
	map.once('moveend', function(){
		if ($(window).height() < 620){
			$('#main').animate({scrollTop: $('#status').position().top - 38}, 1000);				
		}
	});
	/* change to imagery when zoomed in */
	map.on('moveend', function(evt){
		var isOrtho = $.inArray(map.getView().getResolution(), nyc.ol.layer.BaseLayer.RESOLUTIONS) > 4
		ortho.setVisible(isOrtho);
		base.setVisible(!isOrtho);
	});
	map.getView().fit(nyc.NYC_EXTENT, map.getSize());
	
	nyc.app = new nyc.App(map, new nyc.Style());
	
	/* override back button */
	if (window.history && window.history.pushState) {
		$(window).on('popstate', function() {
			if (location.hash.split("#!/")[1] !== '') {
				if (window.location.hash === '') {
				  if ($('#status').css('display') == 'none'){
					  nyc.app.back();
				  }
				}
			}
		});
	}

	/* initialize menu actions */
	$('body').click(function(e){
		var target = e.target, slide = true;
		$.each($('#menu-btn, #lang-choice, #menu, #share-btns'), function(_, container){
			slide = slide && !$.contains(container, target) && target != container;
		});
		if (slide){
			nyc.app.slide();
		}
	});
	
});