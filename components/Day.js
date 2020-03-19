const Country = require('./Country');

class Day {
	constructor() {
		this.isEstimation = false;
		// Stores each individual country
		this.countries = [];
		// Stores geojson
		this.geojson = [];
		// this.fetchCoordinates();
	}

	// Adds data from a region
	addData(
		cases,
		deaths,
		recovered,
		countryName,
		date,
		population,
		coordinates,
		continent
	) {
		let index = this.searchForCountry(countryName);
		if (index > -1) {
			this.countries[index].additionalData(cases, deaths, recovered);
		} else {
			const newCountry = new Country(
				cases,
				deaths,
				recovered,
				countryName,
				population,
				[coordinates[1], coordinates[0]],
				continent
			);
			newCountry.estimatedDay = this.isEstimation;
			this.countries[this.countries.length] = newCountry;
		}
		this.date = date;
	}

	setIsEstimation(val) {
		this.isEstimation = val;
	}

	getIsEstimation() {
		return this.isEstimation;
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
		return this.countries.findIndex(country => country.name == countryName);
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
