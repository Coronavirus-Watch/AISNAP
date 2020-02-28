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
	// Parses the text
	countries = parse(res);
	// Displays the map
	displayMap(countries);
});

// Parses the text
function parse(text) {
	// Stores the individual countries
	let countries = [];
	// Seperating each lines
	const lines = text.split('\n');
	// Loops through each line
	for (let i = 0; i < lines.length; i++) {
		// Extracts each line
		const countryLine = lines[i].split(',');
		// Adds the countries array
		countries.push({
			// Extracts each parameter
			name: countryLine[3],
			lat: parseFloat(countryLine[1].trim()),
			lon: parseFloat(countryLine[2].trim())
		});
	}
	return countries;
}

// Displays the map
function displayMap(countries) {
	// Creates a map and sets basic properties
	var map = new mapboxgl.Map({
		container: 'map',
		// Sets the map style
		style: 'mapbox://styles/maxwillkelly/ck74w75df0dtf1imcwnew4m6b',
		// Displays the world
		zoom: 1.1,
		center: [10, 25]
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