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

// Default (MapBox) Markers and Features data structures
let sources = {
	countries: {},
	routes: [],
	geoCountries: []
};

// GUI elements
const routesCheck = document.querySelector('#routes');
const markersCheck = document.querySelector('#markers');
const checked = document.querySelector('input[type=radio]:checked');
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

const radioBtns = document.querySelectorAll('input[type=radio]');
radioBtns.forEach(btn => {
	btn.addEventListener('change', e => {
		toggledLayers.checkedRadio = e.target.value;
		updateMap(toggledLayers);
	});
});
// when map first loads on webpage
map.on('load', async () => {
	const Routes = new Routes();
	// collects all markers in an array
	const markers = await fetchMarkers();

	// collects all routes in an Object
	// const routes = await fetchRoutes(markers);
	// Adds routes to layers
	addLayers();
	// displays map
	displayMap(toggledLayers);

	// updates the map with defaults
	updateMap(toggledLayers);
});

// Fetches Location Data of Countries
const fetchMarkers = async () => {
	// retrieves data from countries file
	const response = await fetch('../data/countries.txt');
	// parses data into text
	const data = await response.text();
	// parses the data into list of markers
	const markers = parseMarkers(data);
	// returns an array of (MapBox) Markers
	return markers;
};

// Parses the marker text data
function parseMarkers(text) {
	// splits the text into lines in the file
	const lines = text.split('\n');
	// Loops through each line
	for (let i = 0; i < lines.length; i++) {
		// Extracts each line
		const countryLine = lines[i].split(',');
		// Adds to the markers Object with respective lat, lon based on the country
		sources.countries[countryLine[3].trim()] = {
			lat: countryLine[1].trim(),
			lon: countryLine[2].trim()
		};
		let lon = parseFloat(countryLine[2].trim());
		let lat = parseFloat(countryLine[1].trim());
		sources['geoCountries'].push({
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [lon, lat]
			},
			properties: {
				title: countryLine[3].trim(),
				icon: 'playground'
			}
		});
	}
}

import { Routes } from './Routes.js';
const routes = new Routes();

// fetches routes from text file
// const fetchRoutes = async data => {
// 	// retrieves text data from file
// 	const res = await fetch('../data/parsedDomesticsOutput.txt');
// 	// parses the response data into plain text
// 	const text = await res.text();
// 	// parses the data into a routes Object
// 	const routes = await parseRoutes(text);

// 	// returns Object of all routes
// 	return routes;
// };

// // Parses the routes text data
// const parseRoutes = text => {
// 	// splits text up into lines in the file
// 	const lines = text.split('\n');

// 	// goes through each route in the file
// 	for (let i = 0; i < lines.length; i++) {
// 		// splits each route into a "journey"
// 		let journey = lines[i].split(',');

// 		// checks if the the journey start and end location both exist
// 		if (
// 			sources.countries[journey[1]] != undefined &&
// 			sources.countries[journey[3]] != undefined
// 		) {
// 			// creates coordinate arrays for both start and end locations
// 			let fromCoord = [
// 				parseFloat(sources.countries[journey[1]].lon),
// 				parseFloat(sources.countries[journey[1]].lat)
// 			];
// 			let toCoord = [
// 				parseFloat(sources.countries[journey[3]].lon),
// 				parseFloat(sources.countries[journey[3]].lat)
// 			];

// 			// pushes a new (MapBox) "Feature" to the features array
// 			sources['routes'].push({
// 				type: 'Feature',
// 				geometry: {
// 					type: 'LineString',
// 					coordinates: [fromCoord, toCoord]
// 				}
// 			});
// 		}
// 	}
// };

// Adds Layers to Map
function addLayers() {
	// Adds new source for routes
	map.addSource('route', {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: sources.routes
		}
	});

	map.addSource('country', {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: sources.geoCountries
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
