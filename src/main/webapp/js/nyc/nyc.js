/** @export */
window.nyc = window.nyc || {};

proj4.defs(
	'EPSG:2263',
	'+proj=lcc +lat_1=41.03333333333333 +lat_2=40.66666666666666 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000.0000000001 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=ft +to_meter=0.3048006096012192 +no_defs'
);

/**
 * @const
 * @type {ol.extent}
 */
nyc.NYC_EXTENT = [917090, 119053, 1073317, 273931];

/**
 * @const
 * @type {ol.proj.Projection}
 */
nyc.EPSG_2263 = ol.proj.get('EPSG:2263');


/**
 * @const
 * @type {ol.Coordinate}
 */
nyc.NYC_CENTER = [990203, 196492];
