import { Country } from './Country.js';
export class Routes {
	constructor() {
		this.countries = this.fetchCountries(); // fetch countries.txt
		this.routes = this.fetchRoutes();
		console.log('hello');
	}

	async fetchCountries() {
		// retrieves data from countries file
		const response = await fetch('../data/countries.txt');
		// parses data into text
		const data = await response.text();
		//
		this.parseCountries(data);
	}

	async parseCountries(text) {
		// splits the text into lines in the file
		const lines = text.split('\n');
	}

	// fetches routes from text file
	async fetchRoutes() {
		// retrieves text data from file
		const res = await fetch('../data/parsedDomesticsOutput.txt');
		// parses the response data into plain text
		const text = await res.text();
		// parses the data into a routes Object
		const routes = await this.parseRoutes(text);
		// returns Object of all routes
		console.log(routes);
		this.routes = routes;
	}

	// Parses the routes text data
	async parseRoutes(text) {
		// splits text up into lines in the file
		const lines = text.split('\n');

		// goes through each route in the file
		for (let i = 0; i < lines.length; i++) {
			// splits each route into a "journey"
			this.journey = lines[i].split(',');

			// checks if the the journey start and end location both exist
			if (
				sources.countries[journey[1]] != undefined &&
				sources.countries[journey[3]] != undefined
			) {
				// creates coordinate arrays for both start and end locations
				this.fromCoord = {
					lat: parseFloat(sources.countries[journey[1]].lon),
					lon: parseFloat(sources.countries[journey[1]].lat)
				};
				this.toCoord = {
					lat: parseFloat(sources.countries[journey[3]].lon),
					lon: parseFloat(sources.countries[journey[3]].lat)
				};
				const origin = {
					name: '',
					lat: this.fromCoord.lat,
					lon: this.toCoord.lon
				};
				const destination = {
					name: '',
					lat: this.toCoord.lat,
					lon: this.toCoord.lon
				};
				this.routes.push(new Route(origin, destination));
			}

			// pushes a new (MapBox) "Feature" to the features array
			sources['routes'].push({
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: [fromCoord, toCoord]
				}
			});
		}
	}
}

class Route {
	constructor(origin, destination) {
		this.origin = {
			name: origin.name,
			coordinates: {
				lat: origin.lat,
				lon: origin.lon
			}
		};
		this.destination = {
			name: destination.name,
			coordinates: {
				lat: destination.lat,
				lon: destination.lon
			}
		};
	}
}
