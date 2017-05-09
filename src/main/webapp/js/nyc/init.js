$(document).ready(function(){
	
	var map = new nyc.ol.Basemap({target: $('#map')[0]});
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
		$('#first-load').fadeOut();
	});
	/* change to imagery when zoomed in */
	map.on('moveend', function(evt){
		map[map.getView().getZoom() > 11 ? 'showPhoto' : 'hidePhoto']();
	});
	
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