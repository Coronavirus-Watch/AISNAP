import { Routes } from './Routes.js';
import { Timeline } from './Timeline.js';

/* Useful resources:
  https://dev.to/wuz/building-a-country-highlighting-tool-with-mapbox-2kbh
  https://bl.ocks.org/danswick/fc56f37c10d40be62e4feac5984250d2
*/

// Access Token for mapbox
mapboxgl.accessToken =
	'pk.eyJ1IjoibWF4d2lsbGtlbGx5IiwiYSI6ImNrNjhsOWdlZTA0M2Yza21mMG9icjBwdmIifQ.OTaUkNePX-6XE3Vgcy9v6A';
let map = new mapboxgl.Map({
	container: 'map',
	// Sets the map style
	style: 'mapbox://styles/maxwillkelly/ck74w75df0dtf1imcwnew4m6b',
	// Displays the world
	zoom: 3,
	center: [15, 50]
});

// sets default visibility of layers
let toggledLayers = {
	routesVisible: false,
	markersVisible: false,
	checkedRadio: 'cases'
};

// GUI elements
const routesCheck = document.querySelector('#routes');
const markersCheck = document.querySelector('#markers');
const radioBtns = document.querySelectorAll('input[type=radio]');
const dateSlider = document.getElementById('dateSlider');
const dateDisplayed = document.getElementById('dateDisplayed');
dateSlider.max = 100;

// Adds EventListeners to checkboxes for when their checked value changes
routesCheck.addEventListener('change', e => {
	toggledLayers.routesVisible = e.target.checked;
	updateMap(toggledLayers);
});

markersCheck.addEventListener('change', e => {
	toggledLayers.markersVisible = e.target.checked;
	updateMap(toggledLayers);
});

radioBtns.forEach(btn => {
	btn.addEventListener('change', e => {
		toggledLayers.checkedRadio = e.target.value;
		updateMap(toggledLayers);
	});
});
// when map first loads on webpage
let routes = new Routes();
let timeline = new Timeline();
map.on('load', async () => {
	// collects all markers in an array
	// const markers = await fetchMarkers();

	await routes.init();
	await routes.parseGeoJSON();
	await timeline.init();
	await timeline.addCoordinates(routes);
	dateSlider.max = await timeline.getRange();
	// collects all routes in an Object
	// const routes = await fetchRoutes(markers);
	// Adds routes to layers
	addLayers();
	// displays map
	displayMap(toggledLayers);

	// updates the map with defaults
	updateMap(toggledLayers);
});

// Adds Layers to Map
function addLayers() {
	// Adds new source for routes
	if (routes.geojson.length == 0) {
		console.log('sugar me timbers');
	}
	map.addSource('route', {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: routes.geojson
		}
	});
	map.addSource('country', {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: routes.allCountries.geojson
		}
	});
	console.log(routes.geojson);

	// map.addSource('timeline', {
	// 	type: 'geojson',
	// 	data: {
	// 		type: 'FeatureCollection',
	// 		features: timeline.geojson
	// 	}
	// })

	// Styles layer 'route'
	map.addLayer({
		id: 'route',
		type: 'line',
		source: 'route',
		layout: {
			'line-cap': 'square',
			visibility: 'none'
		},
		paint: {
			'line-color': '#777',
			'line-width': 1,
			'line-opacity': 0.05
		}
	});

	map.addLayer({
		id: 'country',
		type: 'symbol',
		source: 'country',
		layout: {
			'icon-image': ['concat', ['get', 'icon'], '-15'],
			'text-field': ['get', 'title'],
			'text-font': ['Open Sans Semibold'],
			'text-offset': [0, 0.6],
			'text-anchor': 'top',
			visibility: 'none'
		},
		paint: {
			'text-color': 'white'
		}
	});
}

// Displays the map
function displayMap() {
	// Adds full screen control
	map.addControl(new mapboxgl.FullscreenControl());

	// Prevents map from looking stupid
	map.resize();
}

// Updates the map with the correct visible layers
function updateMap(toggledLayers) {
	if (toggledLayers.routesVisible == true) {
		map.setLayoutProperty('route', 'visibility', 'visible');
	} else {
		map.setLayoutProperty('route', 'visibility', 'none');
	}
	if (toggledLayers.markersVisible == true) {
		map.setLayoutProperty('country', 'visibility', 'visible');
	} else {
		map.setLayoutProperty('country', 'visibility', 'none');
	}
}

dateSlider.addEventListener('input', function(e) {
	let date = new Date(2020, 0, 22);
	var day = 60 * 60 * 24 * 1000;

	date = new Date(date.getTime() + this.value * day);
	dateDisplayed.innerHTML = formatDate(date);
});

// Returns the date formatted as used in the url for files
function formatDate(date) {
	const day = ('0' + String(date.getDate())).slice(-2);
	const month = ('0' + String(date.getMonth() + 1)).slice(-2);
	const year = String(date.getFullYear());
	const dateVar = 'Date: ' + day + '/' + month + '/' + year;
	return dateVar;
}
