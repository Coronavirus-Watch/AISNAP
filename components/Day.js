const Country = require('./Country');

class Day {
	constructor(precition = false) {
		// Stores each individual country
		this.countries = [];
		// Stores geojson
		this.geojson = [];
		// this.fetchCoordinates();
		this.prediction = prediction;
	}

	// Adds data from a region
	addData(cases, deaths, recovered, countryName, date, population, coordinates, continent) {
		let index = this.searchForCountry(countryName);
		this.date = date;
		// Checks if a country is in the array
		if (index > -1) {
			this.countries[index].additionalData(cases, deaths, recovered);
		} else {
			this.countries[this.countries.length] = new Country(
				cases,
				deaths,
				recovered,
				countryName,
				population, 
				[coordinates[1], coordinates[0]],
				continent
			);
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
