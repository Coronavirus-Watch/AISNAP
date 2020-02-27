/* Useful resources:
  https://dev.to/wuz/building-a-country-highlighting-tool-with-mapbox-2kbh
  https://bl.ocks.org/danswick/fc56f37c10d40be62e4feac5984250d2
*/

// Access Token for mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoibWF4d2lsbGtlbGx5IiwiYSI6ImNrNjhsOWdlZTA0M2Yza21mMG9icjBwdmIifQ.OTaUkNePX-6XE3Vgcy9v6A';
// Stores the countries
let countries = [];
// Fetches Location Data of Countries
const output = fetch('js/countries.txt').then(res => res.text()).then(res => {
	countries = parse(res);
	displayMap(countries);
});

// 
function parse(text) {
	let countries = [];
	const lines = text.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const countryLine = lines[i].split(',');
		countries.push({
			name: countryLine[3],
			lat: parseFloat(countryLine[1].trim()),
			lon: parseFloat(countryLine[2].trim())
		});
	}
	return countries;
}

// Displays the map to the user
function displayMap(countries) {
	// Creates a map and sets basic properties
	var map = new mapboxgl.Map({
		container: 'map',
		// Sets the map style
		style: 'mapbox://styles/maxwillkelly/ck74w75df0dtf1imcwnew4m6b',
		// Displays the world
		zoom: 0,
		center: [10, 50]
	});
	// Adds full screen control
	map.addControl(new mapboxgl.FullscreenControl());

	for (let i = 0; i < countries.length; i++) {
		// create a HTML element for each feature
		var el = document.createElement('div');
		el.className = 'marker';

		// make a marker for each feature and add to the map
		let array = [countries[i].lon, countries[i].lat];

		// Runs when a country is clicked on
		map.on('click', 'countries', function (mapElement) {
			let popup = new mapboxgl.Marker(el).setLngLat(array).addTo(map);
		});
	}

	// Prevents map from looking stupid
	map.resize();
}