const Country = require('./Country');
class Day {
	constructor() {
		// Stores each individual country
		this.countries = [];
	}

	// Adds data from a region
	addData(cases, deaths, recovered, countryName, day) {
		this.day = day;
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
		console.log('Day: ' + this.day);
		this.countries.forEach(element => {
			element.print();
		});
	}
}

module.exports = Day;
