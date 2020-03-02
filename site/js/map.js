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
// Stores the countries
let countries = {};
// Fetches Location Data of Countries
fetch('js/countries.txt')
	.then(res => res.text())
	.then(res => {
		// Parses the text
		countries = parse(res);
		// Displays the map
		displayMap(countries);
		map.on('load', function drawRoutes() {
			fetch('js/parsedDomesticsOutput.txt')
				.then(res => res.text())
				.then(res => {
					const lines = res.split('\n');
					let allFeatures = [];
					for (let i = 0; i < lines.length; i++) {
						let journey = lines[i].split(',');
						if (
							countries[journey[1]] != undefined &&
							countries[journey[3]] != undefined
						) {
							let fromCoord = [
								parseFloat(countries[journey[1]].lon),
								parseFloat(countries[journey[1]].lat)
							];
							let toCoord = [
								parseFloat(countries[journey[3]].lon),
								parseFloat(countries[journey[3]].lat)
							];
							const rand = '#'+Math.floor(Math.random()*16777215).toString(16);
							allFeatures.push({
								type: 'Feature',
								geometry: {
									'type': 'LineString',
									'coordinates': [fromCoord, toCoord]
								}
							});
						}
					}
					console.log(allFeatures.length);
					map.addSource('route', {
						type: 'geojson',
						data: {
							'type': 'FeatureCollection',
							'features': allFeatures
						}
					});
					map.addLayer({
						id: 'route',
						type: 'line',
						source: 'route',
						layout: {
							'line-cap': 'square',
						},
						paint: {
							'line-color': '#aaa',
							'line-width': 1,
							'line-opacity': 0.1
						}
					});
				});
		});
	});

// 		// const fromPos = countries[journey[1]];
// 		// const toPos = countries[journey[3]];
// 		// const fromCoord = [fromPos.lon, fromPos.lat];
// 		// const toCoord = [toPos.lon, toPos.lat];
// 		// console.log(journey);
// 	//

// Parses the text
function parse(text) {
	// Seperating each lines
	const lines = text.split('\n');
	// Loops through each line
	for (let i = 0; i < lines.length; i++) {
		// Extracts each line
		const countryLine = lines[i].split(',');
		// Adds the countries array
		countries[countryLine[3].trim()] = {
			lat: countryLine[1].trim(),
			lon: countryLine[2].trim()
		};
	}
	return countries;
}

// Displays the map
function displayMap(countries) {
	// Creates a map and sets basic properties
	// Adds full screen control
	map.addControl(new mapboxgl.FullscreenControl());

	Object.entries(countries).map(country => {
		let array = [country[1].lon, country[1].lat];
		let popup = new mapboxgl.Popup({ offset: 25 }).setText(country[0]);

		// let marker = new mapboxgl.Marker().setLngLat(array).setPopup(popup);
		// marker.className = "marker";
		// marker.addTo(map);
	});

	// Prevents map from looking stupid
	map.resize();
}
