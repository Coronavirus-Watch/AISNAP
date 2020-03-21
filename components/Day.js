const Continent = require('./Continent');
const Country = require('./Country');
const World = require('./World');

class Day {
	constructor() {
		// Stores whether this is an estimated day not based on official figures
		this.isEstimation = false;
		// Stores each individual country
		this.countries = [];
		// Stores statistics from individual countries spanning across a continent
		this.continents = [];
		// Stores statistics from individual countries spanning across the world
		this.world = new World();
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
			index = this.countries.length;
			this.countries[index] = newCountry;
		}
		// TODO: Process continent and world info
		this.world.additionalData(cases, deaths, recovered);
		this.processContinent(
			index,
			continent,
			cases,
			deaths,
			recovered,
			population
		);
		this.date = date;
	}

	processContinent(
		countryIndex,
		continent,
		cases,
		deaths,
		recovered,
		population
	) {
		// Checks if continent exists on array
		const contienentIndex = this.searchContinent(
			this.countries[countryIndex].name
		);

		if (contienentIndex > -1) {
			let country = this.countries[countryIndex];
			let contienent = this.contienent[contienentIndex];
			contienent.additionalData(cases, deaths, recovered);
		} else {
			this.addNewContinent(
				countryIndex,
				continent,
				cases,
				deaths,
				recovered,
				population
			);
		}
	}

	// Returns the index of a chosen continent on the continents array
	searchContinent(name) {
		return this.continents.findIndex(continent => continent.name == name);
	}

	addNewContinent(countryIndex, name, cases, deaths, recovered, population) {
		let country = this.countries[countryIndex];
		// TODO: Setting of population maybe should be reviewed
		let continent = new Continent(
			name,
			cases,
			deaths,
			recovered,
			population
		);
		this.continents[this.continents.length] = continent;
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
