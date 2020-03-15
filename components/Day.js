const Country = require('./Country');
const fetch = require('node-fetch');
const fs = require('fs');

class Day {
	constructor(date) {
		// Stores the date
		this.date = date;
		// Stores each individual country
		this.countries = [];
		// Stores geojson
		this.geojson = [];
		this.fetchCoordinates();
	}

	// Basically its putting every days stats into every Day
	// would it not be better to do the fetching/parsing in Timeline
	// Do you mean for the coordinates which is probably the case
	// yeah we fetch the countries.txt in the timeline class
	// That's fine, you can work on that

	// Adds data from a region
	addData(cases, deaths, recovered, countryName) {
		let index = this.searchForCountry(countryName);
		// Checks if a country is in the array
		if (index > -1) {
			this.countries[index].additionalData(cases, deaths, recovered);
		} else {
			this.countries[this.countries.length] = new Country(
				cases,
				deaths,
				recovered,
				countryName
			);
		}
	}

	async fetchCoordinates() {
		// retrieves data from countries file
		const response = await fs.readFileSync('./data/countries.txt', 'utf8');
		await this.parseCoordinates(await response);
	}

	async parseCoordinates(text) {
		// splits the text into lines in the file
		const lines = text.split('\n');
		for (let i = 0; i < lines.length; i++) {
			// Extracts each line
			const countryLine = lines[i].split(',');
			// Adds to the markers Object with respective lat, lon based on the country
			// console.log(countryLine);
			if (countryLine[1] != undefined && countryLine[2] != undefined) {
				const coordinates = [
					parseFloat(countryLine[2]),
					parseFloat(countryLine[1])
				];
				try {
					this.countries[countryLine[3].trim()].addCoordinates(
						coordinates
					);
				} catch (e) {
					// console.error();
					// These are countries without any cases so its fine
					// countryLine[3].trim() + " apparently doesn't exist
				}
			}
		}
	}

	parseGeoJSON() {
		let tempArray = [];
		if (this.countries) {
			for (let country in this.countries) {
				try {
					tempArray.push({
						type: 'Feature',
						geometry: {
							type: 'Point',
							coordinates: this.countries[country].coordinates
						},
						properties: {
							title: this.countries[country].name,
							icon: 'basketball',
							cases: this.countries[country].cases,
							deaths: this.countries[country].deaths,
							recovered: this.countries[country].recovered
						}
					});
				} catch (e) {
					console.log(e);
				}
			}
		}
		this.geojson = tempArray;
	}

	getCountryCoordinates(country) {
		if (this.countries[country.name]) {
			return this.countries[country.name].coordinates;
		}
		console.log('Country Not Found: ' + country.name);
		return [0, 0];
	}

	// Checks if a country is on the array
	searchForCountry(countryName) {
		for (let i = 0; i < this.countries.length; i++) {
			const element = this.countries[i];
			if (element.name === countryName) {
				return i;
			}
		}
		return -1;
	}

	// Prints all data stored
	print() {
		console.log('Day: ' + this.date);
		this.countries.forEach(element => {
			element.print();
		});
	}
}

module.exports = Day;
