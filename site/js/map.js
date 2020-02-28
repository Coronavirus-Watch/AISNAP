/* Useful resources:
  https://dev.to/wuz/building-a-country-highlighting-tool-with-mapbox-2kbh
  https://bl.ocks.org/danswick/fc56f37c10d40be62e4feac5984250d2
*/

// Access Token for mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoibWF4d2lsbGtlbGx5IiwiYSI6ImNrNjhsOWdlZTA0M2Yza21mMG9icjBwdmIifQ.OTaUkNePX-6XE3Vgcy9v6A';
let map = new mapboxgl.Map({
	container: 'map',
	// Sets the map style
	style: 'mapbox://styles/maxwillkelly/ck74w75df0dtf1imcwnew4m6b',
	// Displays the world
	zoom: 3,
	center: [15, 50],
});
// Stores the countries
let countries = [];
// Fetches Location Data of Countries
fetch('js/countries.txt').then(res => res.text()).then(res => {
	// Parses the text
	countries = parse(res);
	// Displays the map
	displayMap(countries);
	drawRoutes(countries);
});

function drawRoutes(countries) {
	fetch('js/parsedDomesticsOutput.txt').then(res => res.text()).then(res => {
		let parsedRoutes = {};
		const lines = res.split("\n");
		for (let i = 0; i < lines.length; i++) {
			parsedRoutes[line[1]] = {
				
			}
		}
	});
}




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
	
	// Adds full screen control
	map.addControl(new mapboxgl.FullscreenControl());
			


	countries.map((country) => {
		let array = [country.lon, country.lat];
		let popup = new mapboxgl.Popup({ offset: 25 }).setText(
			country.name
			);

			let marker = new mapboxgl.Marker().setLngLat(array).setPopup(popup);
			marker.className = "marker";
			marker.addTo(map);
			// create a line between UK and America
	})

	// Prevents map from looking stupid
	map.resize();
}