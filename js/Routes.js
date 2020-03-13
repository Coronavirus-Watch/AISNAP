import { Countries } from './Countries.js';
export class Routes {
	constructor() {
		this.allCountries = new Countries();
		this.routes = [];
		this.geojson = [];
	}

	async init() {
		await this.allCountries.init();
		await this.fetchRoutes();
		await this.allCountries.parseGeoJSON();
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
		this.routes = routes;
	}

	// Parses the routes text data
	async parseRoutes(text) {
		// splits text up into lines in the file
		const lines = text.split('\n');

		// goes through each route in the file
		for (let i = 0; i < lines.length; i++) {
			// splits each route into a "journey"
			const journey = lines[i].split(',');
			if (
				this.allCountries.countries[journey[3]] !== undefined &&
				this.allCountries.countries[journey[1]] !== undefined
			) {
				const fromCoord = [
					parseFloat(
						this.allCountries.countries[journey[1]].coordinates[0]
					),
					parseFloat(
						this.allCountries.countries[journey[1]].coordinates[1]
					)
				];
				const toCoord = [
					parseFloat(
						this.allCountries.countries[journey[3]].coordinates[0]
					),
					parseFloat(
						this.allCountries.countries[journey[3]].coordinates[1]
					)
				];

				const origin = {
					name: journey[1].trim(),
					coordinates: fromCoord
				};
				const destination = {
					name: journey[3].trim(),
					coordinates: toCoord
				};
				const newRoute = new Route(origin, destination);
				this.routes.push(newRoute);
			}
		}
		return this.routes;
	}

	parseGeoJSON() {
		let tempArray = [];
		this.routes.forEach(route => {
			tempArray.push({
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: [
						route.origin.coordinates,
						route.destination.coordinates
					]
				}
			});
		});
		this.geojson = tempArray;
	}
}

class Route {
	constructor(newOrigin, newDestination) {
		this.origin = {
			name: newOrigin.name,
			coordinates: newOrigin.coordinates
		};
		this.destination = {
			name: newDestination.name,
			coordinates: newDestination.coordinates
		};
	}
	getOrigin() {
		return this.origin;
	}
	getDestination() {
		return this.destination;
	}
}
