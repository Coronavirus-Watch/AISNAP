import { Routes } from './Routes.js';
import { Timeline } from './Timeline.js';
import { Countries } from './Countries.js';

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
	zoom: 2,
	center: [15, 50]
});

// GUI elements
const routesCheck = document.querySelector('#routes');
const markersCheck = document.querySelector('#markers');
const radioBtns = document.querySelectorAll('input[type=radio]');
const dateSlider = document.getElementById('dateSlider');
const dateDisplayed = document.getElementById('dateDisplayed');
dateSlider.max = 100;

// sets default visibility of layers
let toggledLayers = {
	routesVisible: false,
	markersVisible: false,
	checkedRadio: 'cases'
};

// Instances of Classes
let countries = new Countries();
let routes = new Routes();
let timeline = new Timeline();

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

map.on('load', async () => {
	// collects all markers in an array
	// const markers = await fetchMarkers();

	// await routes.init();
	// await routes.parseGeoJSON();
	await timeline.init();
	await timeline.parseTimeline();
	// await timeline.addCoordinates(routes);
	dateSlider.max = await timeline.getRange();
	// collects all routes in an Object
	// const routes = await fetchRoutes(markers);
	// Adds routes to layers
	addLayers();
	// displays map
	displayMap(toggledLayers);
	// updates the map with defaults
	updateMap(toggledLayers);

	// plays the timeline
	// play();
});

// Adds Layers to Map
function addLayers() {
	// Adds new source for routes
	map.addSource('route', {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: timeline.routes.geojson
		}
	});
	map.addSource('country', {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: timeline.countriesInstance.geojson
		}
	});

	map.addSource('timeline', {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: timeline.currentDay
		}
	});

	map.addLayer({
		id: 'cases-circles',
		type: 'circle',
		source: 'timeline',
		paint: {
			'circle-radius': ['*', ['log10', ['number', ['get', 'cases']]], 20],
			'circle-opacity': 0.4,
			'circle-color': 'orange'
		}
	});

	map.addLayer({
		id: 'deaths-circles',
		type: 'circle',
		source: 'timeline',
		paint: {
			'circle-radius': [
				'*',
				['log10', ['number', ['get', 'deaths']]],
				20
			],
			'circle-opacity': 0.4,
			'circle-color': 'red'
		}
	});

	map.addLayer({
		id: 'recovered-circles',
		type: 'circle',
		source: 'timeline',
		paint: {
			'circle-radius': [
				'*',
				['log10', ['number', ['get', 'recovered']]],
				20
			],
			'circle-opacity': 0.4,
			'circle-color': 'green'
		}
	});
	map.addLayer({
		id: 'recovered-labels',
		type: 'symbol',
		source: 'timeline',
		paint: {
			'text-color': 'white'
		},
		layout: {
			'text-field': ['to-string', ['get', 'recovered']],
			'text-size': 12,
			'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
		}
	});
	map.addLayer({
		id: 'cases-labels',
		type: 'symbol',
		source: 'timeline',
		paint: {
			'text-color': 'white'
		},
		layout: {
			'text-field': ['to-string', ['get', 'cases']],
			'text-size': 12,
			'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
		}
	});
	map.addLayer({
		id: 'deaths-labels',
		type: 'symbol',
		source: 'timeline',
		paint: {
			'text-color': 'white'
		},
		layout: {
			'text-field': ['to-string', ['get', 'deaths']],
			'text-size': 12,
			'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
		}
	});

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

async function play() {
	const max = await timeline.getMax();
	let counter = 0;
	setInterval(() => {
		dateSlider.stepUp();
		dateSlider.dispatchEvent(new Event('input'));
		if (counter == max) {
			return;
		}
	}, 200);
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
	switch (toggledLayers.checkedRadio) {
		case 'cases':
			map.setLayoutProperty('cases-labels', 'visibility', 'visible');
			map.setLayoutProperty('cases-circles', 'visibility', 'visible');
			map.setLayoutProperty('deaths-labels', 'visibility', 'none');
			map.setLayoutProperty('deaths-circles', 'visibility', 'none');
			map.setLayoutProperty('recovered-labels', 'visibility', 'none');
			map.setLayoutProperty('recovered-circles', 'visibility', 'none');
			break;
		case 'deaths':
			map.setLayoutProperty('cases-labels', 'visibility', 'none');
			map.setLayoutProperty('cases-circles', 'visibility', 'none');
			map.setLayoutProperty('deaths-labels', 'visibility', 'visible');
			map.setLayoutProperty('deaths-circles', 'visibility', 'visible');
			map.setLayoutProperty('recovered-labels', 'visibility', 'none');
			map.setLayoutProperty('recovered-circles', 'visibility', 'none');
			break;
		case 'recovered':
			map.setLayoutProperty('cases-labels', 'visibility', 'none');
			map.setLayoutProperty('cases-circles', 'visibility', 'none');
			map.setLayoutProperty('deaths-labels', 'visibility', 'none');
			map.setLayoutProperty('deaths-circles', 'visibility', 'none');
			map.setLayoutProperty('recovered-labels', 'visibility', 'visible');
			map.setLayoutProperty('recovered-circles', 'visibility', 'visible');
	}
}
// it bloody worked, kinda
// Well it works for one day anyway
// i reckon we use timeline.retrieveDay() to update the geojson
// Excellent we need a listner
dateSlider.addEventListener('input', async function(e) {
	let date = new Date(2020, 0, 22);
	var day = 60 * 60 * 24 * 1000;

	date = new Date(date.getTime() + this.value * day);
	dateDisplayed.innerHTML = formatDate(date);

	timeline.currentDay = await timeline.retrieveDay(e.target.value);
	map.getSource('timeline').setData({
		type: 'FeatureCollection',
		features: timeline.currentDay
	});

	updateMap(toggledLayers);
});

// Returns the date formatted as used in the url for files
function formatDate(date) {
	const day = ('0' + String(date.getDate())).slice(-2);
	const month = ('0' + String(date.getMonth() + 1)).slice(-2);
	const year = String(date.getFullYear());
	const dateVar = 'Date: ' + day + '/' + month + '/' + year;
	return dateVar;
}
