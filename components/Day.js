const Country = require('./Country');

class Day {
	constructor() {
		this.isEstimation = false;
		// Stores each individual country
		this.countries = [];
		// Stores statistics from individual countries spanning across a continent
		this.continents = [];
		// Stores statistics from individual countries spanning across the world
		this.world;
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
		continent,
		altSpellings
	) {
		let index = this.searchForCountry(countryName);
		if (index > -1) {
			// TODO: Delete previous data from contienent and world
			this.countries[index].additionalData(cases, deaths, recovered);
		} else {
			const newCountry = new Country(
				cases,
				deaths,
				recovered,
				countryName,
				population,
				[coordinates[1], coordinates[0]],
				continent,
				altSpellings
			);
			const i = this.countries.length;
			this.countries[i] = newCountry;
			// TODO: Process continent and world info
			this.processContinent(newCountry, i, true);
		}
		this.date = date;
	}

	processContinent(countryIndex, isNewCountry) {
		// Checks if continent exists on array
		const contienentIndex = searchContinent(this.continents[index].continent);
		if (contienentIndex > -1) {
			if (isNewCountry) {
				addToContinent(countryIndex, contienentIndex);
			}
		}
		else {

		}
	}

	searchContinent(name) {
		return this.continents.findIndex(continent => continent.name == countryName);
	}

	addToContinent(countryIndex, contienentIndex) {
		let country = this.countries[countryIndex];
		let contienent = this.contienent[contienentIndex];
		continent
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
